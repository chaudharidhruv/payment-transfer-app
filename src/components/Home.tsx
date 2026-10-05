
// <<<<<<< HEAD
// 'use client';

// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import BalanceChart from "@/components/balancechart";

// interface HomeProps {
//   balance: number;
// }

// export default function Home({ balance }: HomeProps) {
//   const [balanceData, setBalanceData] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { data: session } = useSession();

//   useEffect(() => {
//     async function fetchBalanceData() {
//       const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';  // Get API URL from .env.local

//       try {
//         const email = session?.user?.email; // Get the email from session
//         if (!email) {
//           throw new Error('User email not found');
//         }

//         const response = await fetch(`${API_URL}/api/balancechart?email=${encodeURIComponent(email)}`);

//         if (!response.ok) {
//           throw new Error("Failed to fetch balance data.");
//         }

//         const data = await response.json();
//         console.log(data); // Log the response to check the structure
        
//         // Ensure the data structure is correct before setting it
//         const parsedData = data.balanceHistory.map((item: any) => ({
//           updated_at: new Date(item.updated_at), // Ensure 'updated_at' is a Date
//           balance: item.balance,
//         }));

//         setBalanceData(parsedData);
//       } catch (err: any) {
//         setError(err.message || "Error fetching data");
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchBalanceData();
//   }, [session]); // Re-run the effect when session changes

//   return (
//     <div className="bg-gray-700 rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-6">
//       <h2 className="text-3xl font-bold text-white tracking-tight">
//         Your Account Balance
//       </h2>
//       <p className="text-5xl font-extrabold text-green-400">
//         ${balance.toFixed(2)}
//       </p>
//       <h3 className="text-white text-sm font-semibold mb-1">Balance History</h3>

//       {loading ? (
//         <p className="text-white">Loading chart...</p>
//       ) : error ? (
//         <p className="text-red-500">{error}</p>
//       ) : (
//         <BalanceChart data={balanceData} />
//       )}
//     </div>
//   );
// }
// =======
// // components/Home.tsx
// 'use client';

// import BalanceChart from '@/components/balanceChartSample';

// interface HomeProps {
//   balance: number;  // always provided by the parent
// }

// const balanceData = [
//   { date: "2024-04-01", balance: 100 },
//   { date: "2024-04-03", balance: 250 },
//   { date: "2024-04-05", balance: 150 },
//   { date: "2024-04-06", balance: 500 },
//   { date: "2024-04-07", balance: 30 },
//   { date: "2024-04-08", balance: 220 },
//   { date: "2024-04-09", balance: 69 },
// ];

// export default function Home({ balance }: HomeProps) {
//   return (
//     <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-8 flex flex-col items-center space-y-6">
//       <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
//         Your Account Balance
//       </h2>
//       <p className="text-5xl font-extrabold text-[var(--accent)]">
//         ${balance.toFixed(2)}
//       </p>
//       <h3 className="text-[var(--text-secondary)] text-sm font-semibold mb-1">
//         Balance History
//       </h3>
//       <BalanceChart data={balanceData} />
//     </div>
//   );
// }
// >>>>>>> eb545918f967819e3f09434be17ea3b95fa5cdd0.
'use client';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import BalanceChart from "@/components/balancechart";

interface HomeProps {
  balance: number;
}

export default function Home({ balance }: HomeProps) {
  const [balanceData, setBalanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    async function fetchBalanceData() {
      const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

      try {
        const email = session?.user?.email;
        if (!email) throw new Error('User email not found');

        const response = await fetch(`${API_URL}/api/balancechart?email=${encodeURIComponent(email)}`);
        if (!response.ok) throw new Error("Failed to fetch balance data");

        const data = await response.json();
        const parsedData = data.balanceHistory.map((item: any) => ({
          updated_at: new Date(item.updated_at),
          balance: item.balance,
        }));

        setBalanceData(parsedData);
      } catch (err: any) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    }

    fetchBalanceData();
  }, [session]);

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl shadow-md p-8 flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
        Your Account Balance
      </h2>
      <p className="text-5xl font-extrabold text-[var(--accent)]">
        ${balance.toFixed(2)}
      </p>
      <h3 className="text-[var(--text-secondary)] text-sm font-semibold mb-1">
        Balance History
      </h3>

      {loading ? (
        <p className="text-[var(--text-primary)]">Loading chart...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <BalanceChart data={balanceData} />
      )}
    </div>
  );
}
