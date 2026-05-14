import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/session';
import { getConversationForUser, listMessages } from '@/lib/chat-db';
import ChatBox from './ChatBox';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConversationPage({ params }: PageProps) {
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) notFound();

  const user = await getSessionUser();
  if (!user) redirect('/login');

  const convo = getConversationForUser(conversationId, user.id);
  if (!convo) notFound();

  const messages = listMessages(conversationId);
  const isBuyer = convo.buyer_user_id === user.id;
  const partnerName = isBuyer ? convo.store_name : convo.buyer_name;
  const partnerLink = isBuyer ? `/store/${convo.seller_id}` : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ minHeight: 'calc(100vh - 200px)' }}>
      <div className="flex items-center justify-between mb-4">
        <Link href="/messages" className="text-sm text-muted hover:text-primary">
          ← Зурвасууд
        </Link>
        <div className="text-right">
          {partnerLink ? (
            <Link href={partnerLink} className="font-bold hover:text-primary">
              🏪 {partnerName}
            </Link>
          ) : (
            <p className="font-bold">👤 {partnerName}</p>
          )}
        </div>
      </div>

      <ChatBox
        conversationId={conversationId}
        currentUserId={user.id}
        initialMessages={messages}
      />
    </div>
  );
}
