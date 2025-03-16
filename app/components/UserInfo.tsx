'use client';

import { useSession, signOut } from 'next-auth/react';
import Image from 'next/image';
import React from 'react';

export default function UserInfo() {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="rounded-lg border p-8 shadow-lg">
      <div className="flex items-center gap-8">
        
        <div>
          <p className="text-xl font-semibold">{session.user.name}</p>
          <p className="text-gray-500">{session.user.email}</p>
        </div>
      </div>
      <button
        onClick={() => signOut()}
        className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
      >
        Sign Out
      </button>
    </div>
  );
} 