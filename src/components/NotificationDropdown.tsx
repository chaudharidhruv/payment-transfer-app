// components/NotificationDropdown.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';

interface RequestItem {
  id: number;
  sender_id: string;
  amount: number;
  currency: string;
  description: string;
  created_at: string;
}

export default function NotificationDropdown() {
  const { data: session } = useSession();
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [open, setOpen] = useState(false);
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [unread, setUnread] = useState(false);

  useEffect(() => {
    const email = session?.user?.email;
    if (!email || !baseUrl) return;

    const storageKey = `requests_count_${email}`;
    const storedCount = parseInt(localStorage.getItem(storageKey) ?? '0', 10);

    (async () => {
      try {
        const res = await fetch(
          `${baseUrl}/api/requests?email=${encodeURIComponent(email)}`
        );
        if (res.ok) {
          const data = (await res.json()) as { requests: RequestItem[] };
          setRequests(data.requests);

          const currentCount = data.requests.length;
          if (currentCount > storedCount) {
            setUnread(true);
          }
          localStorage.setItem(storageKey, currentCount.toString());
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    })();
  }, [session?.user?.email, baseUrl]);

  const toggleOpen = () => {
    setOpen(o => !o);
    if (!open) setUnread(false);
  };

  const next = () =>
    setIdx(i => (requests.length ? (i + 1) % requests.length : 0));
  const prev = () =>
    setIdx(i => (requests.length ? (i + requests.length - 1) % requests.length : 0));

  const handleSendClick = () => {
    const req = requests[idx];
    router.push(
      `/?tab=send&recipient=${encodeURIComponent(req.sender_id)}` +
      `&amount=${req.amount.toFixed(2)}`
    );
  };

  return (
    <div className="relative inline-block text-left">
      <div onClick={toggleOpen} className="relative cursor-pointer">
        <Bell className="h-6 w-6 text-[var(--accent)]" />
        {unread && (
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-60 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg p-4 z-10">
          {requests.length > 0 ? (
            <>
              <div className="space-y-1 text-[var(--text-primary)] text-sm">
                <div>
                  <strong>{requests[idx].sender_id}</strong> requested{' '}
                  <strong>
                    ${requests[idx].amount.toFixed(2)}{' '}
                    {requests[idx].currency.toUpperCase()}
                  </strong>
                </div>
                {requests[idx].description && (
                  <div className="italic text-[var(--text-secondary)]">
                    {requests[idx].description}
                  </div>
                )}
                <div className="text-[var(--text-secondary)] text-xs">
                  {new Date(requests[idx].created_at).toLocaleString()}
                </div>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <button
                  onClick={handleSendClick}
                  className="px-3 py-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium rounded"
                >
                  Send
                </button>
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                  <ChevronLeft
                    onClick={prev}
                    className="h-5 w-5 cursor-pointer hover:text-[var(--text-primary)]"
                  />
                  <span className="text-xs">
                    {idx + 1} / {requests.length}
                  </span>
                  <ChevronRight
                    onClick={next}
                    className="h-5 w-5 cursor-pointer hover:text-[var(--text-primary)]"
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-[var(--text-secondary)] text-center text-sm">
              No requests
            </p>
          )}
        </div>
      )}
    </div>
  );
}