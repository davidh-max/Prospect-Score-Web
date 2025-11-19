'use client';

import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Phone, Mail, MapPin } from 'lucide-react';
import { updateProspect, ProspectDetail } from '@/lib/actions/prospects';
import { toast } from 'sonner';

interface EditProspectSheetProps {
  prospect: ProspectDetail;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditProspectSheet({
  prospect,
  isOpen,
  onOpenChange,
}: EditProspectSheetProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: prospect.name,
    phone: prospect.phone,
    email: prospect.email,
    location: prospect.location,
    status: prospect.status,
    substatus: prospect.substatus || '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateProspect(prospect.id, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        status: formData.status,
        substatus: formData.substatus || undefined,
      });

      if (result.success) {
        toast.success('Prospecto actualizado correctamente');
        onOpenChange(false);
      } else {
        toast.error(result.error || 'Error al actualizar el prospecto');
      }
    } catch (error) {
      toast.error('Error al actualizar el prospecto');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-96 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left text-2xl font-bold">
            Editar prospecto
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Nombre y apellidos:
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Nombre completo"
              className="border-gray-300 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Número de teléfono:
            </Label>
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+34 600 000 000"
              className="border-gray-300 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              Correo electrónico:
            </Label>
            <Input
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@ejemplo.com"
              type="email"
              className="border-gray-300 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              Dirección
            </Label>
            <Input
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="Ciudad, País"
              className="border-gray-300 h-10"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Status:</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue placeholder="Seleccionar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fase inicial">Fase inicial</SelectItem>
                <SelectItem value="Fase avanzada">Fase avanzada</SelectItem>
                <SelectItem value="Contratado">Contratado</SelectItem>
                <SelectItem value="Rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">
              Substatus:
            </Label>
            <Select value={formData.substatus} onValueChange={(value) => handleInputChange('substatus', value)}>
              <SelectTrigger className="h-10 border-gray-300">
                <SelectValue placeholder="Seleccionar substatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Sin substatus</SelectItem>
                <SelectItem value="Primer contacto">Primer contacto</SelectItem>
                <SelectItem value="Propuesta enviada">Propuesta enviada</SelectItem>
                <SelectItem value="Negociación">Negociación</SelectItem>
                <SelectItem value="Cierre">Cierre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="pt-4">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-cyan-100 hover:bg-cyan-200 text-cyan-700 h-10 font-medium"
            >
              {isSaving ? 'Guardando...' : 'Editar'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
