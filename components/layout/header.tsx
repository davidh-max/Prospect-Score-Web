'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  FileText,
  CheckCircle2,
  Bell,
  Calendar,
  Search,
  UserPlus,
  User,
} from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'General', icon: FileText },
    { href: '/dashboard/tasks', label: 'Tareas', icon: CheckCircle2, badge: 2 },
    { href: '/dashboard/notifications', label: 'Notificaciones', icon: Bell },
    { href: '/dashboard/calendar', label: 'Calendario', icon: Calendar },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname === href || pathname?.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Título Home y Navegación Principal */}
        <div className="flex items-center gap-6">
          {/* Título Home */}
          <div className="flex items-center gap-2">
            <Home className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-semibold text-slate-900">Home</span>
          </div>
          
          {/* Navegación Principal */}
          <nav className="flex items-center gap-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  active
                    ? 'text-[#2bbcd9] font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
                {item.badge && (
                  <Badge className="ml-1 h-5 w-5 flex items-center justify-center p-0 bg-[#2bbcd9] text-white text-xs font-bold rounded-full">
                    {item.badge}
                  </Badge>
                )}
                {/* Indicador de activo - línea inferior azul */}
                {active && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2bbcd9]" />
                )}
              </Link>
            );
          })}
          </nav>
        </div>

        {/* Barra de búsqueda y acciones de usuario */}
        <div className="flex items-center gap-4">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar por nombre, email, número..."
              className="pl-10 w-64 h-9 text-sm border-slate-200 focus:border-[#2bbcd9] focus:ring-[#2bbcd9]"
            />
          </div>

          {/* Iconos de usuario */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <UserPlus className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              <User className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

