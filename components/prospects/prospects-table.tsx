'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Edit, Eye } from 'lucide-react';
import { EditProspectSheet } from './edit-prospect-sheet';
import { ProspectDetail } from '@/lib/actions/prospects';

interface ProspectsTableProps {
  prospects: ProspectDetail[];
  isLoading?: boolean;
}

export function ProspectsTable({
  prospects,
  isLoading = false,
}: ProspectsTableProps) {
  const [selectedProspect, setSelectedProspect] = useState<ProspectDetail | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleEditClick = (prospect: ProspectDetail) => {
    setSelectedProspect(prospect);
    setIsSheetOpen(true);
  };

  const scoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-gray-500">Cargando...</div>;
  }

  if (prospects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No se encontraron prospectos
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Prospecto
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Última Interacción
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Ubicación
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  CTA
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Detalles
                </th>
              </tr>
            </thead>
            <tbody>
              {prospects.map((prospect, index) => (
                <tr
                  key={prospect.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-semibold text-gray-500 w-6">
                        #{index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={prospect.avatar_color + ' text-white font-semibold'}>
                          {prospect.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {prospect.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {prospect.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-6 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{ width: `${prospect.score}%` }}
                        ></div>
                      </div>
                      <span className={`text-sm font-semibold ${scoreColor(prospect.score)}`}>
                        {prospect.score.toFixed(2)}%
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prospect.phone || '-'}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prospect.email}
                  </td>

                  <td className="px-6 py-4">
                    <Badge
                      variant="outline"
                      className="border-cyan-300 bg-cyan-50 text-cyan-700 hover:bg-cyan-50"
                    >
                      {prospect.status}
                    </Badge>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prospect.last_interaction_text}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-900">
                    {prospect.location}
                  </td>

                  <td className="px-6 py-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="bg-purple-100 text-purple-700 hover:bg-purple-200 h-8 text-xs"
                    >
                      {prospect.cta_text}
                    </Button>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditClick(prospect)}
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        title="Ver ficha"
                      >
                        <FileText className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProspect && (
        <EditProspectSheet
          prospect={selectedProspect}
          isOpen={isSheetOpen}
          onOpenChange={setIsSheetOpen}
        />
      )}
    </>
  );
}
