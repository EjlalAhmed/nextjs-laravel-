import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Classic Expense Tracker',
  description: 'A refined classic-style expense tracker built with Next.js and Laravel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
