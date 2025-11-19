'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Building2, 
  Plug, 
  BookOpen, 
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export default function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error('Error al cerrar sesión', {
        description: error.message,
      });
    } else {
      toast.success('Sesión cerrada correctamente');
      router.push('/login');
      router.refresh();
    }
  };

  const menuItems = [
    { href: '/dashboard', label: 'Inicio', icon: Home },
    { href: '/dashboard/prospects', label: 'Prospectos', icon: Users },
    { href: '/dashboard/interactions', label: 'Interacciones', icon: MessageSquare },
    { href: '/dashboard/properties', label: 'Propiedades', icon: Building2 },
    { href: '/dashboard/integrations', label: 'Integraciones', icon: Plug },
  ];

  const bottomItems = [
    { href: '/dashboard/tutorial', label: 'Tutorial', icon: BookOpen },
    { href: '/dashboard/settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <div className="h-screen w-64 bg-[#113541] flex flex-col fixed left-0 top-0 z-50 overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image
            src="/Prospect Score White.png"
            alt="Prospect Score"
            width={40}
            height={40}
            className="w-10 h-10 object-contain"
            priority
          />
          <div className="flex flex-col">
            <span className="text-white font-semibold text-sm leading-tight">Prospect</span>
            <span className="text-white font-semibold text-sm leading-tight">Score</span>
          </div>
        </Link>
      </div>

      {/* Menú Principal */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-white/10 text-white font-bold border-l-4 border-[#2bbcd9]'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Menú Inferior */}
      <div className="px-3 py-4 border-t border-white/10">
        <ul className="space-y-1">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-white/10 text-white font-bold border-l-4 border-[#2bbcd9]'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Perfil Usuario */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <User className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">
              ¡Hola {userName || 'Usuario'}!
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white/80 hover:bg-white/5 hover:text-white transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Salir</span>
        </button>
      </div>
    </div>
  );
}

