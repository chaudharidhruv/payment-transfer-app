'use client';

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import debounce from "lodash.debounce";

interface UserSuggestion {
  email: string;
  name: string;
}

export default function RequestMoneyForm() {
  const [amount, setAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const [description, setDescription] = useState("");
  const [suggestions, setSuggestions] = useState<UserSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { data: session } = useSession();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL;

  const fetchUsers = useCallback(
    debounce(async (query: string) => {
      if (!query) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const res = await fetch(`${API}/api/users?search=${encodeURIComponent(query)}`);
        if (res.ok) {
          const users: UserSuggestion[] = await res.json();
          setSuggestions(users);
          setShowSuggestions(users.length > 0);
        } else {
          setSuggestions([]);
          setShowSuggestions(false);
        }
      } catch {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [API]
  );

  const handleRecipientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRecipient(e.target.value);
    fetchUsers(e.target.value);
  };

  const selectSuggestion = (email: string) => {
    setRecipient(email);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setShowSuggestions(false);
    }, 150);
  };

  const handleFocus = () => {
    if (recipient && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleRequestMoney = async () => {
    if (!amount || !recipient) {
      alert("Please fill in all required fields.");
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount greater than 0.");
      return;
    }
    if (!session?.user?.email) {
      alert("You must be logged in to request money.");
      return;
    }

    const payload = { amount: parsedAmount, sender: session.user.email, recipient, description };

    try {
      const response = await fetch(`${API}/api/request-money`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        alert("Money request sent!");
        setAmount("");
        setRecipient("");
        setDescription("");
        setSuggestions([]);
        setShowSuggestions(false);
      } else {
        const error = await response.json().catch(() => ({ message: "Unknown server error" }));
        alert(`Failed to request money: ${error.message || "Unknown error"}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      alert(`An error occurred while requesting money: ${err instanceof Error ? err.message : "Network error"}`);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (/^\d*\.?\d{0,2}$/.test(v)) {
      setAmount(v);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] p-6 rounded-lg shadow-md w-full max-w-lg mx-auto space-y-6">
      {/* Amount */}
      <div>
        <label htmlFor="request-amount" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Amount
        </label>
        <input
          id="request-amount"
          type="text"
          inputMode="decimal"
          value={amount}
          onChange={handleAmountChange}
          placeholder="0.00"
          className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
        />
      </div>

      {/* Recipient with autocomplete */}
      <div className="relative">
        <label htmlFor="request-recipient" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Recipient Email
        </label>
        <input
          id="request-recipient"
          type="email"
          autoComplete="off"
          value={recipient}
          onChange={handleRecipientChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Start typing an email"
          className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
        />
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
            {suggestions.map((u) => (
              <li
                key={u.email}
                onMouseDown={(e) => { e.preventDefault(); selectSuggestion(u.email); }}
                className="px-3 py-2 hover:bg-[var(--bg-page)] cursor-pointer text-[var(--text-primary)] text-sm"
              >
                {u.name ? `${u.name} (${u.email})` : u.email}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="request-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
          Description (Optional)
        </label>
        <input
          id="request-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g., For coffee"
          className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleRequestMoney}
        disabled={!amount || !recipient || !session?.user?.email || parseFloat(amount) <= 0}
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Request Payment
      </button>
    </div>
  );
}
