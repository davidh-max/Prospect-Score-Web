import { type TaskStats as TaskStatsType } from '@/lib/actions/tasks';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

interface TaskStatsProps {
  stats: TaskStatsType;
}

export default function TaskStats({ stats }: TaskStatsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-5 h-5 text-[#2bbcd9]" />
        <h2 className="text-lg font-semibold text-slate-800">Tareas Realizadas</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta 1: Total Realizadas */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-2">
              Tareas realizadas en total
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {stats.totalCompleted}
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Total Pendientes */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-2">
              Tareas pendientes en total
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {stats.totalPending}
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Realizadas últimos 7 días */}
        <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-5">
            <p className="text-sm font-medium text-slate-500 mb-2">
              Tareas realizadas en Ult. 7 días
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {stats.completedLast7Days}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

