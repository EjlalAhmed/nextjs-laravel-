import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FlowExpense',
  description: 'Modern personal finance tracker built with Next.js and Laravel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="app-shell">{children}</body>
    </html>
  );
}
