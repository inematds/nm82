'use client';

import { signOut } from 'next-auth/react';
import { useEffect } from 'react';

export default function LogoutPage() {
  useEffect(() => {
    signOut({ callbackUrl: '/auth/login' });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Saindo...</h1>
        <p className="text-gray-500 mt-2">Você será redirecionado em instantes.</p>
      </div>
    </div>
  );
}
