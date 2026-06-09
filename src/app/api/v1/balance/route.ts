import { getSellerBalance, listLedgerForUser } from '@/lib/orders-db';
import { getApiUser, UNAUTHORIZED } from '@/lib/api-auth';

// GET /api/v1/balance (Bearer) -> { balance, ledger }
// The user's available (released-escrow) balance plus recent ledger entries.
export async function GET(req: Request) {
  const user = await getApiUser(req);
  if (!user) return UNAUTHORIZED();
  return Response.json({
    balance: getSellerBalance(user.id),
    ledger: listLedgerForUser(user.id),
  });
}
