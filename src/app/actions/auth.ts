'use server';

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';

const SignupSchema = z.object({
  name: z.string().trim().min(2, 'Нэр доод тал нь 2 тэмдэгт байна'),
  email: z.string().trim().toLowerCase().email('Имэйл буруу байна'),
  password: z.string().min(6, 'Нууц үг доод тал нь 6 тэмдэгт байна'),
});

const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Имэйл буруу байна'),
  password: z.string().min(1, 'Нууц үг шаардлагатай'),
});

export type AuthState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

interface UserRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
}

export async function signup(_state: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirmPassword') ?? '');

  const parsed = SignupSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password,
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  if (password !== confirm) {
    return { errors: { confirmPassword: ['Нууц үг таарахгүй байна'] } };
  }

  const { name, email } = parsed.data;
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return { errors: { email: ['Энэ имэйл бүртгэлтэй байна'] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .run(name, email, passwordHash);

  await createSession({
    id: Number(result.lastInsertRowid),
    name,
    email,
  });

  redirect('/');
}

export async function login(_state: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { email, password } = parsed.data;
  const user = db
    .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
    .get(email) as UserRow | undefined;

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { message: 'Имэйл эсвэл нууц үг буруу байна' };
  }

  await createSession({ id: user.id, name: user.name, email: user.email });
  redirect('/');
}

export async function logout() {
  await deleteSession();
  redirect('/');
}
