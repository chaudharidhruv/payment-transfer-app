// components/PaymentForm.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import Home from './Home';
import SendMoneyForm from './SendMoneyForm';
import RequestMoneyForm from './RequestMoneyForm';
import Transactions from './Transactions';

type Tab = 'home' | 'send' | 'request' | 'transactions';

export default function PaymentForm() {
  const { data: session } = useSession();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;
  const searchParams = useSearchParams();
  const router = useRouter();

  // read `tab`, `recipient`, `amount` from URL
  const urlTab = searchParams.get('tab') as Tab | null;
  const paramRecipient = searchParams.get('recipient') ?? '';
  const paramAmount = searchParams.get('amount') ?? '';

  // local state defaults from URL or falls back to 'home'
  const [activeTab, setActiveTab] = useState<Tab>(urlTab ?? 'home');
  const [balance, setBalance] = useState<number>(0);

  // sync URL→state when `?tab=` changes
  useEffect(() => {
    if (urlTab && urlTab !== activeTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab, activeTab]);

  const fetchBalance = useCallback(async () => {
    if (!session?.user?.email || !API) return;
    const res = await fetch(
      `${API}/api/balance?email=${encodeURIComponent(session.user.email)}`
    );
    if (res.ok) {
      const { balance } = await res.json();
      setBalance(balance);
    }
  }, [session?.user?.email, API]);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);
  useEffect(() => { if (activeTab === 'home') fetchBalance(); }, [activeTab, fetchBalance]);

  const tabs: Tab[] = ['home', 'send', 'request', 'transactions'];

  return (
    <>
      {/* Sign Out button */}
      {session && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => signOut()}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-4 py-2 rounded-lg transition text-sm"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Main card */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg p-8">
        {/* ——— TABS ——— */}
        <div className="flex space-x-2 mb-6">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                router.push(`/?tab=${tab}`);
              }}
              className={`
                flex-1 py-2 rounded-lg font-medium transition
                ${activeTab === tab
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--bg-page)]'
                }
              `}
            >
              {{
                home: 'Home',
                send: 'Send Money',
                request: 'Request Money',
                transactions: 'Transactions',
              }[tab]}
            </button>
          ))}
        </div>

        {/* ——— CONTENT PANE ——— */}
        <div className="bg-[var(--bg-page)] rounded-lg p-6 border border-[var(--border)] shadow-sm">
          {activeTab === 'home' && <Home balance={balance} />}
          {activeTab === 'send' && (
            <SendMoneyForm
              initialRecipient={paramRecipient}
              initialAmount={paramAmount}
            />
          )}
          {activeTab === 'request' && <RequestMoneyForm />}
          {activeTab === 'transactions' && <Transactions />}
        </div>
      </div>
    </>
  );
}
