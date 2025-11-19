'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus } from 'lucide-react';

export default function TasksFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [priority, setPriority] = useState(searchParams.get('priority') || '');

  // Actualizar URL cuando cambien los filtros
  const updateFilters = (newQuery?: string, newType?: string, newPriority?: string) => {
    const params = new URLSearchParams();
    const finalQuery = newQuery !== undefined ? newQuery : query;
    const finalType = newType !== undefined ? newType : type;
    const finalPriority = newPriority !== undefined ? newPriority : priority;

    if (finalQuery) params.set('query', finalQuery);
    if (finalType) params.set('type', finalType);
    if (finalPriority) params.set('priority', finalPriority);

    router.push(`/dashboard/tasks?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      updateFilters(query, type, priority);
    }
  };


  return (
    <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Buscar prospecto por nombre..."
              className="pl-10 h-10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          {/* Select Tipo */}
          <Select
            value={type}
            onValueChange={(value) => {
              setType(value);
              updateFilters(query, value, priority);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px] h-10">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos</SelectItem>
              <SelectItem value="Llamada">Llamada</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Reunión">Reunión</SelectItem>
              <SelectItem value="Visita">Visita</SelectItem>
            </SelectContent>
          </Select>

          {/* Select Prioridad */}
          <Select
            value={priority}
            onValueChange={(value) => {
              setPriority(value);
              updateFilters(query, type, value);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px] h-10">
              <SelectValue placeholder="Prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todas</SelectItem>
              <SelectItem value="Alta">Alta</SelectItem>
              <SelectItem value="Media">Media</SelectItem>
              <SelectItem value="Baja">Baja</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón Añadir */}
          <Button
            className="bg-[#2bbcd9] hover:bg-[#229ab3] text-white h-10 px-6 font-semibold transition-colors duration-200"
            onClick={() => {
              // TODO: Implementar modal de añadir tarea
              console.log('Add task');
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Añadir tarea
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

