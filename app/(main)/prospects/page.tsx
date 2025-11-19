import { Suspense } from 'react';
import { getProspects } from '@/lib/actions/prospects';
import { ProspectsToolbar } from '@/components/prospects/prospects-toolbar';
import { ProspectsTable } from '@/components/prospects/prospects-table';

interface ProspectsPageProps {
  searchParams: {
    query?: string;
    location?: string;
    status?: string;
    substatus?: string;
    scoreMin?: string;
    scoreMax?: string;
  };
}

async function ProspectsContent({ filters }: { filters: any }) {
  const prospects = await getProspects({
    query: filters.query,
    location: filters.location,
    status: filters.status,
    scoreRange: {
      min: parseInt(filters.scoreMin || '0'),
      max: parseInt(filters.scoreMax || '100'),
    },
  });

  return <ProspectsTable prospects={prospects} />;
}

export default function ProspectsPage({ searchParams }: ProspectsPageProps) {
  const filters = {
    query: searchParams.query || '',
    location: searchParams.location || '',
    status: searchParams.status || '',
    substatus: searchParams.substatus || '',
    scoreMin: searchParams.scoreMin || '0',
    scoreMax: searchParams.scoreMax || '100',
  };

  return (
    <div className="space-y-6">
      <ProspectsToolbar />

      <Suspense fallback={<div className="text-center py-8 text-gray-500">Cargando prospectos...</div>}>
        <ProspectsContent filters={filters} />
      </Suspense>
    </div>
  );
}
