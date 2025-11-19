'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error('Error al iniciar sesión', {
          description: error.message,
        });
      } else {
        toast.success('Sesión iniciada correctamente');
        router.push('/dashboard');
        router.refresh();
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al intentar iniciar sesión',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Columna Izquierda - Formulario */}
      <div className="flex w-full flex-col bg-white lg:w-1/2 overflow-y-auto h-screen">
        <div className="flex-1 flex flex-col items-center justify-center p-12">
          <div className="w-full max-w-md space-y-8">
            {/* Logo */}
            <div className="flex justify-start mb-8">
              <Image
                src="/logo-standard.png"
                alt="Prospect Score"
                width={192}
                height={48}
                className="w-48 h-auto"
                priority
              />
            </div>

            {/* Título */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Iniciar Sesión</h1>
            </div>

            {/* Formulario */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ejemplo@compañiaxyz.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-[#2bbcd9] hover:text-[#229ab3] hover:underline"
                  >
                    ¿Has olvidado tu contraseña?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-[#71b0bd] hover:bg-[#5d95a1] text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Botón Google */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-11 border-gray-300 bg-white hover:bg-gray-50"
              disabled={isLoading}
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continuar con Google
              </span>
            </Button>

            {/* Enlace de Registro */}
            <div className="text-center text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                href="/signup"
                className="text-[#2bbcd9] hover:text-[#229ab3] hover:underline font-medium"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Columna Derecha - Imagen de Marketing */}
      <div className="hidden lg:block lg:w-1/2 relative h-screen">
        <Image
          src="/hero-image.png"
          alt="Prospect Score Dashboard"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
