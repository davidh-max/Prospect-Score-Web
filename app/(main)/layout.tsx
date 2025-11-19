import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/sidebar';
import Header from '@/components/layout/header';

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Obtener nombre del usuario
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle();

  const userName = profile?.first_name || user.email?.split('@')[0] || 'Usuario';

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Fijo */}
      <Sidebar userName={userName} userEmail={user.email} />

      {/* Contenedor Principal */}
      <div className="flex-1 h-screen flex flex-col ml-64 bg-[#F3F4F6]">
        {/* Header */}
        <Header />
        
        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

