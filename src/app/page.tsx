// src/app/page.tsx
'use client';

import { signIn, useSession } from 'next-auth/react';
import NotificationDropdown from '@/components/NotificationDropdown';
import ThemeToggle from '@/components/ThemeToggle';
import PaymentForm from '@/components/PaymentForm';

export default function HomePage() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--bg-page)] px-4">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg p-10 text-center shadow-md max-w-md w-full">
          <h1 className="text-3xl font-semibold mb-6 text-[var(--text-primary)]">
            Welcome to <span className="text-[var(--accent)]">i-Pay</span>
          </h1>
          <button
            onClick={() => signIn('google')}
            className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-lg font-medium mb-4"
          >
            Sign in with Google
          </button>
          <p className="text-[var(--text-secondary)]">Please sign in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center bg-[var(--bg-page)] text-[var(--text-primary)] py-12 px-4 sm:px-6 lg:px-8">
      {/* Top-left: Theme toggle */}
      <div className="absolute top-6 left-6">
        <ThemeToggle />
      </div>

      {/* Top-right: Notification bell */}
      <div className="absolute top-6 right-6">
        <NotificationDropdown />
      </div>

      {/* Main content */}
      <div className="w-full max-w-4xl">
        <h2 className="text-3xl font-medium text-center mb-8">
          Hi, {session.user?.name}
        </h2>
        <PaymentForm />
      </div>
    </div>
  );
}