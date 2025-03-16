import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Link from 'next/link';
import UserInfo from './components/UserInfo';
import React from 'react';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-8">Welcome to Next.js Authentication</h1>
        {session ? (
          <UserInfo />
        ) : (
          <Link
            href="/auth/signin"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Sign In
          </Link>
        )}
      </div>
    </main>
  );
} 