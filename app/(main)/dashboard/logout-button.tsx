'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
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
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al intentar cerrar sesión',
      });
    }
  };

  return (
    <Button onClick={handleLogout} variant="outline">
      Cerrar Sesión
    </Button>
  );
}

