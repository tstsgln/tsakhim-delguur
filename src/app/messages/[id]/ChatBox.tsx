'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sendMessage, type SendMessageState } from '@/app/actions/chat';
import type { MessageRow } from '@/lib/chat-db';

interface Props {
  conversationId: number;
  currentUserId: number;
  initialMessages: MessageRow[];
}

function formatTime(iso: string): string {
  const d = new Date(iso + 'Z');
  return d.toLocaleTimeString('mn-MN', { hour: '2-digit', minute: '2-digit' });
}

export default function ChatBox({ conversationId, currentUserId, initialMessages }: Props) {
  const router = useRouter();
  const bound = sendMessage.bind(null, conversationId);
  const [state, action, pending] = useActionState<SendMessageState, FormData>(bound, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [initialMessages.length, state]);

  useEffect(() => {
    if (!pending) {
      formRef.current?.reset();
    }
  }, [pending]);

  useEffect(() => {
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="flex-1 flex flex-col bg-surface border border-border rounded-xl overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '400px' }}>
        {initialMessages.length === 0 ? (
          <p className="text-sm text-muted text-center py-12">
            Энэ ярианд хараахан зурвас байхгүй байна. Эхний зурвасаа бичээрэй.
          </p>
        ) : (
          initialMessages.map(m => {
            const mine = m.sender_user_id === currentUserId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    mine
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-primary-light/30 text-foreground rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words text-sm">{m.body}</p>
                  <p className={`text-[10px] mt-1 ${mine ? 'text-white/70' : 'text-muted'}`}>
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form ref={formRef} action={action} className="border-t border-border p-3 flex gap-2">
        <input
          name="body"
          type="text"
          autoComplete="off"
          placeholder="Зурвас бичих..."
          className="flex-1 border border-border rounded-full px-4 py-2.5 focus:outline-none focus:border-primary text-sm"
          required
          maxLength={2000}
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm"
        >
          {pending ? '...' : 'Илгээх'}
        </button>
      </form>
      {state?.message && <p className="text-xs text-red-600 px-4 pb-2">{state.message}</p>}
    </div>
  );
}
