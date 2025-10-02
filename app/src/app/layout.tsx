import './globals.css';
import React from 'react';

export const metadata = {
  title: 'LinkedIn Data Hub - Search Jobs, Companies & More',
  description: 'Search LinkedIn for jobs, companies, products, posts, and events. Find your next career opportunity with our powerful search tool.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
