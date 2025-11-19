'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { createClient } from '@/lib/supabase/client';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    country: '',
    companyName: '',
  });
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (!acceptedPrivacy) {
      toast.error('Debes aceptar la Política de privacidad');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.phone,
            city: formData.city,
            country: formData.country,
            company_name: formData.companyName,
          },
        },
      });

      if (error) {
        toast.error('Error al crear la cuenta', {
          description: error.message,
        });
      } else {
        toast.success('Cuenta creada correctamente. Por favor, verifica tu email.');
        router.push('/login');
      }
    } catch (error) {
      toast.error('Error inesperado', {
        description: 'Ocurrió un error al intentar crear la cuenta',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Columna Izquierda - Formulario */}
      <div className="flex w-full flex-col bg-white lg:w-1/2 overflow-y-auto h-screen">
        <div className="flex flex-col min-h-full">
          {/* Header fijo con Logo y Título */}
          <div className="flex-shrink-0 p-12 pb-6">
            <div className="w-full max-w-md mx-auto space-y-6">
              {/* Logo */}
              <div className="flex justify-start">
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
                <h1 className="text-3xl font-bold text-gray-900">Crear Cuenta</h1>
              </div>
            </div>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 flex flex-col items-center justify-center px-12 pb-12">
            <div className="w-full max-w-md space-y-6">
              {/* Formulario */}
              <form onSubmit={handleSignup} className="space-y-6">
                {/* Nombre completo */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Nombre completo
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-xs text-gray-600">
                        Nombre
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="Nombre"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-xs text-gray-600">
                        Apellido
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Apellido"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Número de teléfono
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Ej. 612 345 678"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Correo electrónico
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ejemplo@empresa.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium text-gray-700"
                  >
                    Confirmar contraseña
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Localización */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Localización
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city" className="text-xs text-gray-600">
                        Ciudad
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        type="text"
                        placeholder="Ciudad"
                        value={formData.city}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country" className="text-xs text-gray-600">
                        País
                      </Label>
                      <Input
                        id="country"
                        name="country"
                        type="text"
                        placeholder="País"
                        value={formData.country}
                        onChange={handleChange}
                        required
                        disabled={isLoading}
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Nombre de la empresa */}
                <div className="space-y-2">
                  <Label
                    htmlFor="companyName"
                    className="text-sm font-medium text-gray-700"
                  >
                    Nombre de la empresa
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    type="text"
                    placeholder="Ej. Grupo Inmobiliaria Norte"
                    value={formData.companyName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="h-11"
                  />
                </div>

                {/* Checkbox de privacidad */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacy"
                    checked={acceptedPrivacy}
                    onCheckedChange={(checked) => setAcceptedPrivacy(checked === true)}
                    disabled={isLoading}
                    className="mt-1"
                  />
                  <Label
                    htmlFor="privacy"
                    className="text-sm text-gray-600 leading-relaxed cursor-pointer"
                  >
                    He leído y acepto la{' '}
                    <Link
                      href="https://app.prospectscore.io/privacy_police"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2bbcd9] hover:text-[#229ab3] hover:underline"
                    >
                      Política de privacidad.
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-[#71b0bd] hover:bg-[#5d95a1] text-white"
                  disabled={isLoading || !acceptedPrivacy}
                >
                  {isLoading ? 'Creando cuenta...' : 'Acceder al SaaS'}
                </Button>
              </form>

              {/* Enlace de Login */}
              <div className="text-center text-sm text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link
                  href="/login"
                  className="text-[#2bbcd9] hover:text-[#229ab3] hover:underline font-medium"
                >
                  Iniciar sesión
                </Link>
              </div>
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
