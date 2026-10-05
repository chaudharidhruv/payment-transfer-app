// components/Transactions.tsx
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Transaction {
  created_at: string;   // Timestamp field from Supabase
  description: string;
  amount: number;
  currency: string;
  sender_id: string;
  recipient_id: string;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const { data: session } = useSession();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    async function fetchTransactions() {
      if (!session?.user?.email) return;
      const email = encodeURIComponent(session.user.email);
      try {
        const response = await fetch(
          `${API}/api/transactions?email=${email}`
        );
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions);
        } else {
          console.error("Failed to fetch transactions");
        }
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    }
    fetchTransactions();
  }, [session, API]);

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-lg p-6 w-full">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
        Recent Transactions
      </h2>

      {transactions.length > 0 ? (
        <ul className="space-y-2">
          {transactions.map((tx, index) => {
            const userEmail = session?.user?.email || "";
            const isSender = userEmail === tx.sender_id;
            const effect = isSender ? "-" : "+";
            const colorClass = isSender ? "text-red-500" : "text-green-500";

            const dt = new Date(tx.created_at);
            const date = dt.toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
            });
            const time = dt.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <li
                key={index}
                className="bg-[var(--bg-page)] border border-[var(--border)] rounded-lg p-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[var(--text-secondary)] text-xs">
                      {date} • {time}
                    </p>
                    <p className="text-[var(--text-primary)]">
                      {isSender
                        ? `You sent money to ${tx.recipient_id}`
                        : `You received money from ${tx.sender_id}`}
                    </p>
                    {tx.description && (
                      <p className="text-[var(--text-secondary)] text-xs italic mt-1">
                        {tx.description}
                      </p>
                    )}
                  </div>
                  <div className={`font-semibold ${colorClass}`}>
                    {effect}${tx.amount.toFixed(2)} {tx.currency.toUpperCase()}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[var(--text-secondary)] text-center">
          No transactions found
        </p>
      )}
    </div>
  );
}