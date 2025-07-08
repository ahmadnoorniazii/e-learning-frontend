import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/use-auth';
import { ConditionalLayout } from '@/components/layout/conditional-layout';
import { DashboardRouter } from '@/components/layout/dashboard-router';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'EduPlatform - Learn Without Limits',
  description: 'Modern e-learning platform with courses from industry experts. Master new skills and advance your career.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DashboardRouter />
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}