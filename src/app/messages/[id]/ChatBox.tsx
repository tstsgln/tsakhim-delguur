'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { sendMessage, type SendMessageState } from '@/app/actions/chat';
import type { MessageRow } from '@/lib/chat-db';

const NOTIFY_TITLE = 'Шинэ зурвас';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const lastSeenIdRef = useRef<number>(
    initialMessages.length > 0 ? initialMessages[initialMessages.length - 1].id : 0,
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (preview) URL.revokeObjectURL(preview);
    const f = e.target.files?.[0];
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const clearPreview = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [initialMessages.length, state]);

  useEffect(() => {
    if (!pending) {
      formRef.current?.reset();
      if (preview) {
        URL.revokeObjectURL(preview);
        setPreview(null);
      }
    }
  }, [pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (initialMessages.length === 0) return;
    const newest = initialMessages[initialMessages.length - 1];
    if (newest.id <= lastSeenIdRef.current) {
      lastSeenIdRef.current = newest.id;
      return;
    }
    const incoming = initialMessages.filter(
      m => m.id > lastSeenIdRef.current && m.sender_user_id !== currentUserId,
    );
    lastSeenIdRef.current = newest.id;
    if (incoming.length === 0) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') return;
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const last = incoming[incoming.length - 1];
      try {
        new Notification(NOTIFY_TITLE, { body: last.body, tag: `convo-${conversationId}` });
      } catch {
        // ignore
      }
    }
  }, [initialMessages, currentUserId, conversationId]);

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
                  className={`max-w-[75%] rounded-2xl ${m.image_path ? 'p-1.5' : 'px-4 py-2'} ${
                    mine
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-primary-light/30 text-foreground rounded-bl-sm'
                  }`}
                >
                  {m.image_path && (
                    <a href={m.image_path} target="_blank" rel="noopener noreferrer" className="block">
                      <Image
                        src={m.image_path}
                        alt="Зураг"
                        width={320}
                        height={320}
                        className="rounded-xl max-w-full h-auto object-cover"
                        style={{ maxHeight: '320px', width: 'auto' }}
                      />
                    </a>
                  )}
                  {m.body && (
                    <p className={`whitespace-pre-wrap break-words text-sm ${m.image_path ? 'px-2 pt-1.5' : ''}`}>{m.body}</p>
                  )}
                  <p
                    className={`text-[10px] ${m.image_path ? 'px-2 pb-1' : 'mt-1'} ${
                      mine ? 'text-white/70' : 'text-muted'
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form ref={formRef} action={action} className="border-t border-border p-3">
        {preview && (
          <div className="mb-2 flex items-center gap-2">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
              <Image src={preview} alt="Preview" fill sizes="80px" className="object-cover" unoptimized />
            </div>
            <button
              type="button"
              onClick={clearPreview}
              className="text-xs text-red-600 hover:underline"
            >
              Хасах
            </button>
          </div>
        )}
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            name="image"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFile}
            className="hidden"
            id="chat-image-input"
          />
          <label
            htmlFor="chat-image-input"
            className="cursor-pointer w-10 h-10 flex items-center justify-center rounded-full border border-border hover:bg-primary-light/20 transition-colors flex-shrink-0 text-muted hover:text-primary"
            title="Зураг хавсаргах"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V6h4.05l1.83-2h4.24l1.83 2H20v12zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z" />
            </svg>
          </label>
          <input
            name="body"
            type="text"
            autoComplete="off"
            placeholder="Зурвас бичих..."
            className="flex-1 border border-border rounded-full px-4 py-2.5 focus:outline-none focus:border-primary text-sm"
            maxLength={2000}
          />
          <button
            type="submit"
            disabled={pending}
            className="bg-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-primary-dark transition-colors disabled:opacity-60 text-sm"
          >
            {pending ? '...' : 'Илгээх'}
          </button>
        </div>
      </form>
      {state?.message && <p className="text-xs text-red-600 px-4 pb-2">{state.message}</p>}
    </div>
  );
}
