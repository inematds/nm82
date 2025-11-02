'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Ticket,
  Settings,
  Contact,
  UserCog,
  ChevronDown,
  ChevronRight,
  Mail,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Pessoas', href: '/pessoas', icon: Contact },
  { title: 'Padrinhos', href: '/padrinhos', icon: Users },
  { title: 'Afiliados', href: '/afiliados', icon: UserCheck },
  { title: 'Códigos', href: '/codigos', icon: Ticket },
  {
    title: 'Configuração',
    href: '/admin',
    icon: Settings,
    children: [
      { title: 'Usuários', href: '/admin/usuarios', icon: UserCog },
      { title: 'Templates de Email', href: '/admin/templates-email', icon: Mail },
      { title: 'Configurações Email', href: '/admin/configuracoes-email', icon: Settings },
      { title: 'Anonimização', href: '/admin', icon: Settings },
      { title: 'Página de Convite', href: '/convite', icon: Mail },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Configuração']);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const renderNavItem = (item: NavItem, isChild = false) => {
    const Icon = item.icon;
    const isActive = pathname === item.href;
    const isExpanded = expandedItems.includes(item.title);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div key={item.title}>
          <button
            onClick={() => toggleExpand(item.title)}
            className={cn(
              'flex items-center justify-between w-full gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              pathname.startsWith(item.href)
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="h-5 w-5" />
              {item.title}
            </div>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children?.map((child) => renderNavItem(child, true))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isChild && 'pl-6',
          isActive
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <Icon className="h-5 w-5" />
        {item.title}
      </Link>
    );
  };

  return (
    <aside className="w-64 border-r bg-gray-50 h-full">
      <div className="p-4">
        <h2 className="text-lg font-bold text-gray-900 mb-6">nm82</h2>
        <nav className="space-y-1">
          {navItems.map((item) => renderNavItem(item))}
        </nav>
      </div>
    </aside>
  );
}
