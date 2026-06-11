import 'server-only';
import { readFileSync } from 'node:fs';
import { SignJWT, importPKCS8 } from 'jose';
import { getTokensForUser, deleteDeviceToken } from './push-db';

// Sends FCM push notifications via the HTTP v1 API, authenticated with a service
// account (no firebase-admin dependency — just jose + fetch). Best-effort: if
// FIREBASE_SERVICE_ACCOUNT is unset or sending fails, it silently no-ops.

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

let saLoaded = false;
let serviceAccount: ServiceAccount | null = null;

function getServiceAccount(): ServiceAccount | null {
  if (saLoaded) return serviceAccount;
  saLoaded = true;
  const path = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (path) {
    try {
      serviceAccount = JSON.parse(readFileSync(path, 'utf8')) as ServiceAccount;
    } catch {
      serviceAccount = null;
    }
  }
  return serviceAccount;
}

let cachedToken = { value: '', exp: 0 };

async function getAccessToken(sa: ServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedToken.value && cachedToken.exp - 60 > now) return cachedToken.value;
  try {
    const key = await importPKCS8(sa.private_key, 'RS256');
    const assertion = await new SignJWT({ scope: 'https://www.googleapis.com/auth/firebase.messaging' })
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuer(sa.client_email)
      .setSubject(sa.client_email)
      .setAudience('https://oauth2.googleapis.com/token')
      .setIssuedAt(now)
      .setExpirationTime(now + 3600)
      .sign(key);
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion,
      }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { access_token: string; expires_in?: number };
    cachedToken = { value: json.access_token, exp: now + (json.expires_in ?? 3600) };
    return cachedToken.value;
  } catch {
    return null;
  }
}

/** Push a notification to all of a user's devices. Fire-and-forget friendly. */
export async function sendPushToUser(
  userId: number,
  title: string,
  body: string,
  link?: string,
): Promise<void> {
  const sa = getServiceAccount();
  if (!sa) return;
  const tokens = getTokensForUser(userId);
  if (tokens.length === 0) return;
  const accessToken = await getAccessToken(sa);
  if (!accessToken) return;

  await Promise.all(
    tokens.map(async (token) => {
      try {
        const res = await fetch(
          `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: {
                token,
                notification: { title, body },
                ...(link ? { data: { link } } : {}),
              },
            }),
          },
        );
        // 404 UNREGISTERED / 400 invalid → token is dead, drop it.
        if (res.status === 404 || res.status === 400) deleteDeviceToken(token);
      } catch {
        // network error — ignore, try again next event
      }
    }),
  );
}
