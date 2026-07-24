'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/ledger', label: 'General Ledger' },
  { href: '/reports', label: 'Reports' },
];

const managementNavItems = [
  { href: '/users', label: 'Users' },
];

const accentOptions = ['cyan-violet', 'slate-orange', 'rose-blue', 'orange-violet', 'pink-emerald'];
const sidebarTypes = ['mini', 'hover', 'boxed'];
const activeStyles = ['rounded-one-side', 'rounded-all', 'pill-one-side', 'pill-all'];
const navbarStyles = ['glass', 'color', 'sticky', 'transparent'];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string; role?: string } | null>(null);
  const [theme, setTheme] = useState('dark');
  const [accent, setAccent] = useState('orange-violet');
  const [sidebarColor, setSidebarColor] = useState('dark');
  const [sidebarType, setSidebarType] = useState('boxed');
  const [activeStyle, setActiveStyle] = useState('rounded-all');
  const [navbarStyle, setNavbarStyle] = useState('glass');
  const canManageUsers = user?.role === 'super_admin' || user?.role === 'admin';

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    axios
      .get('http://127.0.0.1:8000/api/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('token');
        router.push('/login');
      });
  }, [router]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme.scheme');
    const savedAccent = localStorage.getItem('theme.accent');
    const savedSidebarColor = localStorage.getItem('theme.sidebarColor');
    const savedSidebarType = localStorage.getItem('theme.sidebarType');
    const savedActiveStyle = localStorage.getItem('theme.activeStyle');
    const savedNavbarStyle = localStorage.getItem('theme.navbarStyle');

    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccent(savedAccent);
    if (savedSidebarColor) setSidebarColor(savedSidebarColor);
    if (savedSidebarType) setSidebarType(savedSidebarType);
    if (savedActiveStyle) setActiveStyle(savedActiveStyle);
    if (savedNavbarStyle) setNavbarStyle(savedNavbarStyle);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme;
    root.dataset.accent = accent;
    root.dataset.sidebarColor = sidebarColor;
    root.dataset.sidebarType = sidebarType;
    root.dataset.activeStyle = activeStyle;
    root.dataset.navbarStyle = navbarStyle;

    localStorage.setItem('theme.scheme', theme);
    localStorage.setItem('theme.accent', accent);
    localStorage.setItem('theme.sidebarColor', sidebarColor);
    localStorage.setItem('theme.sidebarType', sidebarType);
    localStorage.setItem('theme.activeStyle', activeStyle);
    localStorage.setItem('theme.navbarStyle', navbarStyle);
  }, [theme, accent, sidebarColor, sidebarType, activeStyle, navbarStyle]);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');

    try {
      if (token) {
        await axios.post('http://127.0.0.1:8000/api/logout', null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch {
      // Clear the local session even if the server token is already expired.
    } finally {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen">
      <aside className="sidebar">
        <div className="brand-block">
          <p className="muted" style={{textTransform:'uppercase',letterSpacing:'0.18em',fontSize:12}}>Ledger</p>
          <h2 style={{marginTop:8,fontSize:20,fontWeight:700}}>Accounts</h2>
        </div>
        <nav>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
          {canManageUsers && managementNavItems.map((item) => (
            <Link key={item.href} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="main">
        <div className="topbar">
          <button className="profile-button" type="button" onClick={() => setProfileOpen((value) => !value)}>
            <span className="profile-avatar">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <span>
              <strong>{user?.name || 'Customer'}</strong>
              <small>{(user?.role || 'user').replaceAll('_', ' ')}</small>
            </span>
          </button>
          {profileOpen && (
            <div className="profile-menu">
              <Link href="/profile">Profile</Link>
              <button type="button" onClick={handleLogout}>Log out</button>
            </div>
          )}
        </div>
        {children}
      </main>
      <button className="settings-fab" type="button" onClick={() => setSettingsOpen(true)} title="Settings" aria-label="Open settings">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
          <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.04.04a2 2 0 0 1-2.83 2.83l-.04-.04a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 0 1-4 0v-.06A1.7 1.7 0 0 0 8.97 19.4a1.7 1.7 0 0 0-1.88.34l-.04.04a2 2 0 0 1-2.83-2.83l.04-.04A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 0 1 0-4h.06A1.7 1.7 0 0 0 4.6 8.97a1.7 1.7 0 0 0-.34-1.88l-.04-.04a2 2 0 0 1 2.83-2.83l.04.04A1.7 1.7 0 0 0 8.97 4.6 1.7 1.7 0 0 0 10 3.04V3a2 2 0 0 1 4 0v.06a1.7 1.7 0 0 0 1.03 1.54 1.7 1.7 0 0 0 1.88-.34l.04-.04a2 2 0 0 1 2.83 2.83l-.04.04a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.03H21a2 2 0 0 1 0 4h-.06A1.7 1.7 0 0 0 19.4 15Z" />
        </svg>
      </button>
      {settingsOpen && (
        <>
          <button className="settings-scrim" type="button" aria-label="Close settings" onClick={() => setSettingsOpen(false)} />
          <aside className="settings-drawer">
            <div className="settings-header">
              <h2>Settings</h2>
              <button type="button" onClick={() => setSettingsOpen(false)} aria-label="Close settings">x</button>
            </div>

            <section className="settings-section">
              <h3>Scheme</h3>
              <div className="segmented-grid">
                {['auto', 'dark', 'light'].map((option) => (
                  <button key={option} className={theme === option ? 'selected' : ''} type="button" onClick={() => setTheme(option)}>
                    <span>{option === 'auto' ? 'A' : option === 'dark' ? 'D' : 'L'}</span>
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <div className="section-title-row">
                <h3>Color Customizer</h3>
                <button type="button" onClick={() => setAccent('orange-violet')}>Reset</button>
              </div>
              <div className="swatch-row">
                {accentOptions.map((option) => (
                  <button key={option} className={`theme-swatch swatch-${option} ${accent === option ? 'selected' : ''}`} type="button" onClick={() => setAccent(option)} aria-label={option} />
                ))}
              </div>
            </section>

            <section className="settings-section">
              <h3>Scheme Direction</h3>
              <div className="preview-grid two">
                <button className="preview-card selected" type="button">
                  <span className="preview-layout ltr" />
                  LTR
                </button>
                <button className="preview-card" type="button">
                  <span className="preview-layout rtl" />
                  RTL
                </button>
              </div>
            </section>

            <section className="settings-section">
              <h3>Sidebar Color</h3>
              <div className="segmented-grid two">
                {['dark', 'color', 'white', 'transparent'].map((option) => (
                  <button key={option} className={sidebarColor === option ? 'selected' : ''} type="button" onClick={() => setSidebarColor(option)}>
                    <span className={`dot dot-${option}`} />
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <h3>Sidebar Types</h3>
              <div className="preview-grid three">
                {sidebarTypes.map((option) => (
                  <button key={option} className={`preview-card ${sidebarType === option ? 'selected' : ''}`} type="button" onClick={() => setSidebarType(option)}>
                    <span className={`preview-layout sidebar-${option}`} />
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <h3>Sidebar Active Style</h3>
              <div className="preview-grid two">
                {activeStyles.map((option) => (
                  <button key={option} className={`preview-card ${activeStyle === option ? 'selected' : ''}`} type="button" onClick={() => setActiveStyle(option)}>
                    <span className={`preview-layout active-${option}`} />
                    {option.replaceAll('-', ' ')}
                  </button>
                ))}
              </div>
            </section>

            <section className="settings-section">
              <h3>Navbar Style</h3>
              <div className="preview-grid two">
                {navbarStyles.map((option) => (
                  <button key={option} className={`preview-card ${navbarStyle === option ? 'selected' : ''}`} type="button" onClick={() => setNavbarStyle(option)}>
                    <span className={`preview-layout navbar-${option}`} />
                    {option}
                  </button>
                ))}
              </div>
              <button className="default-theme-btn" type="button" onClick={() => {
                setTheme('dark');
                setAccent('orange-violet');
                setSidebarColor('dark');
                setSidebarType('boxed');
                setActiveStyle('rounded-all');
                setNavbarStyle('glass');
              }}>
                <span /> Default
              </button>
            </section>
          </aside>
        </>
      )}
    </div>
  );
}
