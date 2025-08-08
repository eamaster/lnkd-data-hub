import './globals.css';
import React from 'react';

export const metadata = {
  title: 'LinkedIn Data Hub',
  description: 'Proxying LinkedIn data via RapidAPI through Cloudflare Workers',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
