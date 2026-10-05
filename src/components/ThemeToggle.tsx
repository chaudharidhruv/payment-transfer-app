// components/ThemeToggle.tsx
'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  useEffect(() => {
    const cls = document.documentElement.classList;
    theme === 'dark' ? cls.add('dark') : cls.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      aria-label="Toggle theme"
      className="cursor-pointer p-1 transition"
    >
      {theme === 'dark'
        ? <Sun  className="h-6 w-6 text-[var(--accent)]" />
        : <Moon className="h-6 w-6 text-[var(--accent)]" />}
    </button>
  );
}