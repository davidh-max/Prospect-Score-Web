'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, MapPin, Download, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

interface ProspectsToolbarProps {
  onFiltersChange?: (filters: any) => void;
}

export function ProspectsToolbar({ onFiltersChange }: ProspectsToolbarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('query') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [substatus, setSubstatus] = useState(searchParams.get('substatus') || '');
  const [scoreMin, setScoreMin] = useState(
    parseInt(searchParams.get('scoreMin') || '0')
  );
  const [scoreMax, setScoreMax] = useState(
    parseInt(searchParams.get('scoreMax') || '100')
  );

  const handleFilterChange = useCallback(() => {
    const params = new URLSearchParams();

    if (query) params.set('query', query);
    if (location) params.set('location', location);
    if (status) params.set('status', status);
    if (substatus) params.set('substatus', substatus);
    if (scoreMin !== 0) params.set('scoreMin', scoreMin.toString());
    if (scoreMax !== 100) params.set('scoreMax', scoreMax.toString());

    const queryString = params.toString();
    router.push(`/prospects${queryString ? '?' + queryString : ''}`);
  }, [query, location, status, substatus, scoreMin, scoreMax, router]);

  const handleResetFilters = () => {
    setQuery('');
    setLocation('');
    setStatus('');
    setSubstatus('');
    setScoreMin(0);
    setScoreMax(100);
    router.push('/prospects');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleFilterChange();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, location, status, substatus, scoreMin, scoreMax, handleFilterChange]);

  const handleExport = () => {
    // TODO: Implement CSV export
    console.log('Export CSV clicked');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex gap-6 border-b border-gray-200">
            <button className="text-gray-400 text-sm pb-3 transition">
              Prospectos
            </button>
            <button className="text-gray-400 text-sm pb-3 transition">
              On Live
            </button>
            <button className="text-cyan-500 font-medium text-sm border-b-2 border-cyan-500 pb-3">
              Todos los prospectos
            </button>
            <button className="text-gray-400 text-sm pb-3 transition">
              Pipeline
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/prospects/import"
            className="text-cyan-500 text-sm font-medium hover:underline"
          >
            Importar lista de prospectos
          </Link>
          <Button
            onClick={handleExport}
            className="bg-cyan-500 hover:bg-cyan-600 text-white text-sm h-9 px-4 rounded"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar prospectos (.csv)
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 space-y-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nombre o email..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 border-gray-300 h-10"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Ej. Madrid"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="pl-10 border-gray-300 h-10"
            />
          </div>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="h-10 border-gray-300">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fase inicial">Fase inicial</SelectItem>
              <SelectItem value="Fase avanzada">Fase avanzada</SelectItem>
              <SelectItem value="Contratado">Contratado</SelectItem>
              <SelectItem value="Rechazado">Rechazado</SelectItem>
            </SelectContent>
          </Select>

          <Select value={substatus} onValueChange={setSubstatus}>
            <SelectTrigger className="h-10 border-gray-300">
              <SelectValue placeholder="Substatus" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Primer contacto">Primer contacto</SelectItem>
              <SelectItem value="Propuesta enviada">Propuesta enviada</SelectItem>
              <SelectItem value="Negociación">Negociación</SelectItem>
              <SelectItem value="Cierre">Cierre</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Score</label>
            <div className="flex items-center gap-2">
              <Slider
                value={[scoreMin, scoreMax]}
                onValueChange={([min, max]) => {
                  setScoreMin(min);
                  setScoreMax(max);
                }}
                min={0}
                max={100}
                step={1}
                className="flex-1"
              />
              <div className="text-xs text-gray-500 whitespace-nowrap">
                {scoreMin}-{scoreMax}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="text-purple-600 text-sm font-medium hover:underline"
          >
            Resetear filtros
          </button>
        </div>
      </div>
    </div>
  );
}
