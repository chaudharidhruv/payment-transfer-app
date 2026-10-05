// components/SendMoneyForm.tsx
'use client';

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import debounce from "lodash.debounce";

interface UserSuggestion { email: string; name: string; }
interface RecipientInfo {
  recipient: string;
  percentage: string;
  suggestions?: UserSuggestion[];
  showSuggestions?: boolean;
}

interface SendMoneyFormProps {
  initialRecipient?: string;
  initialAmount?: string;
}

export default function SendMoneyForm({
  initialRecipient = "",
  initialAmount = "",
}: SendMoneyFormProps) {
  const { data: session } = useSession();
  const API = process.env.NEXT_PUBLIC_API_BASE_URL!;

  // seeded from props
  const [amount, setAmount] = useState(initialAmount);
  const [numRecipients, setNumRecipients] = useState(
    initialRecipient ? "1" : ""
  );
  const [recipientsInfo, setRecipientsInfo] = useState<RecipientInfo[]>(
    initialRecipient ? [{ recipient: initialRecipient, percentage: "" }] : []
  );
  const [equalSplit, setEqualSplit] = useState(true);
  const [description, setDescription] = useState("");
  const [currency] = useState("USD");

  // if props change, re-seed
  useEffect(() => {
    if (initialRecipient) {
      setNumRecipients("1");
      setRecipientsInfo([{ recipient: initialRecipient, percentage: "" }]);
    }
  }, [initialRecipient]);

  useEffect(() => {
    if (initialAmount) {
      setAmount(initialAmount);
    }
  }, [initialAmount]);

  // rebuild recipients array when count changes
  useEffect(() => {
    const n = parseInt(numRecipients);
    if (isNaN(n) || n <= 0) {
      setRecipientsInfo([]);
      return;
    }
    if (recipientsInfo.length === n) return;
    setRecipientsInfo(old => {
      const arr: RecipientInfo[] = [];
      for (let i = 0; i < n; i++) {
        arr.push(old[i] ?? { recipient: "", percentage: "" });
      }
      return arr;
    });
  }, [numRecipients, recipientsInfo.length]);

  const fetchUsersForIndex = useCallback(
    debounce(async (query: string, idx: number) => {
      if (!query) {
        setRecipientsInfo(cur =>
          cur.map((info, i) =>
            i === idx ? { ...info, suggestions: [], showSuggestions: false } : info
          )
        );
        return;
      }
      try {
        const res = await fetch(`${API}/api/users?search=${encodeURIComponent(query)}`);
        const users: UserSuggestion[] = res.ok ? await res.json() : [];
        setRecipientsInfo(cur =>
          cur.map((info, i) =>
            i === idx
              ? { ...info, suggestions: users, showSuggestions: users.length > 0 }
              : info
          )
        );
      } catch {
        setRecipientsInfo(cur =>
          cur.map((info, i) =>
            i === idx ? { ...info, suggestions: [], showSuggestions: false } : info
          )
        );
      }
    }, 300),
    [API]
  );

  const handleRecipientChangeAt = (idx: number, val: string) => {
    setRecipientsInfo(old =>
      old.map((r, i) => (i === idx ? { ...r, recipient: val } : r))
    );
    fetchUsersForIndex(val, idx);
  };

  const selectSuggestionAt = (idx: number, email: string) => {
    setRecipientsInfo(old =>
      old.map((r, i) =>
        i === idx
          ? { ...r, recipient: email, suggestions: [], showSuggestions: false }
          : r
      )
    );
    document.getElementById(`percentage-${idx}`)?.focus();
  };

  const handleBlurAt = (idx: number) => {
    setTimeout(() => {
      setRecipientsInfo(cur =>
        cur.map((info, i) =>
          i === idx ? { ...info, showSuggestions: false } : info
        )
      );
    }, 150);
  };

  const handleFocusAt = (idx: number) => {
    setRecipientsInfo(cur =>
      cur.map((info, i) =>
        i === idx
          ? { ...info, showSuggestions: (info.suggestions?.length ?? 0) > 0 }
          : info
      )
    );
  };

  const updatePercentageAt = (idx: number, val: string) => {
    if (val === "" || /^\d{0,3}(\.\d{0,2})?$/.test(val)) {
      setRecipientsInfo(old =>
        old.map((r, i) => (i === idx ? { ...r, percentage: val } : r))
      );
    }
  };

  const handleSendMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Enter a valid amount > 0.");
      return;
    }
    if (!session?.user?.email) {
      alert("You must be logged in.");
      return;
    }
    const n = parseInt(numRecipients);
    if (isNaN(n) || n <= 0) {
      alert("Specify a valid number of recipients (>= 1).");
      return;
    }
    if (recipientsInfo.length !== n) {
      alert(`Please enter details for all ${n} recipients.`);
      return;
    }
    for (let i = 0; i < n; i++) {
      if (!recipientsInfo[i].recipient) {
        alert(`Fill in Recipient ${i + 1}'s email.`);
        return;
      }
    }

    const total = parseFloat(amount);
    let splits: { recipient: string; amount: number }[];
    if (equalSplit) {
      const base = parseFloat((total / n).toFixed(2));
      splits = recipientsInfo.map((r, i) => {
        let amt = base;
        if (i === n - 1) {
          const used = base * (n - 1);
          amt = parseFloat((total - used).toFixed(2));
        }
        return { recipient: r.recipient, amount: amt };
      });
    } else {
      splits = recipientsInfo.map(r => ({
        recipient: r.recipient,
        amount: parseFloat(((total * parseFloat(r.percentage)) / 100).toFixed(2)),
      }));
    }

    try {
      const res = await fetch(`${API}/api/send-money`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: session.user.email,
          currency,
          description: description.trim(),
          splits,
        }),
      });
      const text = await res.text();
      if (!res.ok) {
        let err = `Error ${res.status}`;
        try {
          const js = JSON.parse(text);
          err = js.error || js.message || err;
        } catch { }
        throw new Error(err);
      }

      alert("Money sent successfully!");
      setAmount("");
      setNumRecipients("");
      setRecipientsInfo([]);
      setDescription("");
      setEqualSplit(false);
    } catch (error: any) {
      console.error("Send failed:", error);
      alert(`Failed to send payment: ${error.message}`);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-lg p-8 w-full max-w-3xl mx-auto space-y-6">
      {/* Top Row */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Amount */}
        <div className="flex-1">
          <label htmlFor="amount" className="block text-[var(--text-secondary)] mb-1 text-sm">
            Amount
          </label>
          <input
            id="amount"
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={e => {
              const v = e.target.value;
              if (v === "" || /^\d*\.?\d{0,2}$/.test(v)) setAmount(v);
            }}
            placeholder="0.00"
            className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
          />
        </div>

        {/* Currency */}
        <div className="flex-1">
          <label htmlFor="currency" className="block text-[var(--text-secondary)] mb-1 text-sm">
            Currency
          </label>
          <input
            id="currency"
            type="text"
            value="USD - United States Dollar"
            readOnly
            className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] outline-none"
          />
        </div>

        {/* # Recipients */}
        <div className="w-30">
          <label htmlFor="numRecipients" className="block text-[var(--text-secondary)] mb-1 text-sm">
            # Recip.
          </label>
          <input
            id="numRecipients"
            type="number"
            min={1}
            step={1}
            value={numRecipients}
            onChange={e => setNumRecipients(e.target.value)}
            placeholder="#"
            className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
          />
        </div>
      </div>

      {/* Split Mode */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-[var(--text-secondary)]">
          <input
            type="radio"
            checked={!equalSplit}
            onChange={() => setEqualSplit(false)}
            className="form-radio text-[var(--accent)]"
          />
          Custom %
        </label>
        <label className="flex items-center gap-2 text-[var(--text-secondary)]">
          <input
            type="radio"
            checked={equalSplit}
            onChange={() => setEqualSplit(true)}
            className="form-radio text-[var(--accent)]"
          />
          Equal Split
        </label>
      </div>

      {/* Recipients Details */}
      {recipientsInfo.length > 0 && (
        <div className="pt-4 border-t border-[var(--border)] space-y-5">
          {recipientsInfo.map((info, idx) => (
            <div
              key={idx}
              className="bg-[var(--bg-page)] border border-[var(--border)] rounded-lg p-4 space-y-3"
            >
              <h3 className="text-[var(--text-secondary)] font-medium">
                Recipient {idx + 1}
              </h3>

              <div className="relative">
                <input
                  id={`recipient-${idx}`}
                  type="email"
                  autoComplete="off"
                  placeholder="email@example.com"
                  value={info.recipient}
                  onChange={e => handleRecipientChangeAt(idx, e.target.value)}
                  onFocus={() => handleFocusAt(idx)}
                  onBlur={() => handleBlurAt(idx)}
                  className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                />
                {info.showSuggestions && info.suggestions && (
                  <ul className="absolute z-10 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-md mt-1 max-h-40 overflow-auto shadow-lg">
                    {info.suggestions.map(u => (
                      <li
                        key={u.email}
                        onMouseDown={e => {
                          e.preventDefault();
                          selectSuggestionAt(idx, u.email);
                        }}
                        className="px-3 py-2 hover:bg-[var(--bg-page)] cursor-pointer text-[var(--text-primary)] text-sm"
                      >
                        {u.name ? `${u.name} (${u.email})` : u.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!equalSplit && (
                <input
                  id={`percentage-${idx}`}
                  type="text"
                  inputMode="decimal"
                  placeholder="0"
                  value={info.percentage}
                  onChange={e => updatePercentageAt(idx, e.target.value)}
                  className="w-24 p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Description */}
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Description (optional)"
        className="w-full p-3 rounded-lg bg-[var(--bg-page)] text-[var(--text-primary)] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] outline-none"
      />

      {/* Submit */}
      <button
        onClick={handleSendMoney}
        disabled={
          !amount ||
          parseFloat(amount) <= 0 ||
          !numRecipients ||
          parseInt(numRecipients) <= 0 ||
          recipientsInfo.length !== parseInt(numRecipients) ||
          recipientsInfo.some(r => !r.recipient) ||
          (!equalSplit && recipientsInfo.some(r => !r.percentage))
        }
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send Payment
      </button>
    </div>
  );
}
