import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/transactions', label: 'Transactions' },
  { href: '/categories', label: 'Categories' },
  { href: '/reports', label: 'Reports' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <aside className="sidebar">
        <div style={{marginBottom:20}}>
          <p className="muted" style={{textTransform:'uppercase',letterSpacing:'0.18em',fontSize:12}}>FlowExpense</p>
          <h2 style={{marginTop:8,fontSize:20,fontWeight:700}}>Personal Finance</h2>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
