// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-[var(--bg-page)] border-t border-[var(--border)] py-6">
      <div className="container mx-auto text-center text-[var(--text-secondary)] text-sm">
        &copy; {new Date().getFullYear()} i-Pay. All rights reserved.
      </div>
    </footer>
  );
}
// Hello.
