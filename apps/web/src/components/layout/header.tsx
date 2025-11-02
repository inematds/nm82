'use client';

import Link from 'next/link';
import { User, LogOut, Settings } from 'lucide-react';

export function Header() {
  // TODO: Get from session when auth is enabled
  const user = {
    name: 'Admin (Dev Mode)',
    email: 'admin@inema.vip',
    role: 'ADMIN',
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="flex h-16 items-center px-6">
        <div className="flex-1">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-gray-900">INEMA.VIP</span>
            <span className="text-sm text-gray-500">Gestão de Convites</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {/* User Info */}
          <div className="flex items-center gap-3 border-l pl-4">
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-900">
              <User className="h-5 w-5" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 border-l pl-4">
            <button
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              title="Configurações"
            >
              <Settings className="h-4 w-4" />
            </button>
            <Link
              href="/auth/logout"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
