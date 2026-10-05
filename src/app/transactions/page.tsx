'use client';

import { useEffect, useState } from 'react';

interface Transaction {
  id: number;
  date: string;
  amount: number;
  description: string;
}

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      const data: Transaction[] = [];

      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  return (
    <div>
      <h1>Recent Transactions</h1>
      {transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <ul>
          {transactions.map((tx) => (
            <li key={tx.id}>
              {tx.date} - {tx.description}: ${tx.amount}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TransactionsPage;