import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/categories', label: 'Categories' },
  { href: '/reports', label: 'Reports' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,_#f6efe3,_#efe4cc)] text-stone-800">
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-stone-300 bg-[#fffdfa] p-6 shadow-sm">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.35em] text-stone-500">Classic Ledger</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-800">Expense Tracker</h2>
        </div>
        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-100">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
