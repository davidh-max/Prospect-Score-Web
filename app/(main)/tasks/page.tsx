import { Suspense } from 'react';
import { getTasks, getTaskStats, type TaskDetail } from '@/lib/actions/tasks';
import TasksTable from '@/components/tasks/tasks-table';
import TaskStats from '@/components/tasks/task-stats';
import TasksFilters from '@/components/tasks/tasks-filters';
import { ListTodo } from 'lucide-react';

interface SearchParams {
  query?: string | string[];
  type?: string | string[];
  priority?: string | string[];
}

export default async function TasksPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  // Normalizar searchParams (pueden ser string o string[])
  const getParam = (param: string | string[] | undefined): string => {
    if (!param) return '';
    if (Array.isArray(param)) return param[0] || '';
    return param;
  };

  // Obtener tareas con filtros
  const filters = {
    query: getParam(searchParams.query),
    type: getParam(searchParams.type),
    priority: getParam(searchParams.priority),
  };

  let tasks: TaskDetail[] = [];
  let stats = {
    totalCompleted: 0,
    totalPending: 0,
    completedLast7Days: 0,
  };

  try {
    tasks = await getTasks(filters);
    stats = await getTaskStats();
  } catch (error) {
    console.error('Error loading tasks:', error);
  }

  return (
    <div className="p-6 space-y-6">
      {/* Título H1 */}
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
        <ListTodo className="w-6 h-6 text-[#2bbcd9]" />
        Tareas pendientes
      </h1>

      {/* Barra de filtros */}
      <Suspense fallback={<div className="h-20 bg-white rounded-xl border border-slate-100 animate-pulse" />}>
        <TasksFilters />
      </Suspense>

      {/* Tabla de Tareas */}
      <TasksTable tasks={tasks} />

      {/* Footer: Estadísticas */}
      <TaskStats stats={stats} />
    </div>
  );
}
