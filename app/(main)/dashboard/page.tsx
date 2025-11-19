import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDashboardMetrics, getRecentTasks, getProspectsByStatus, getRecentInteractions, type Task, type Prospect, type Interaction } from '@/lib/actions/dashboard';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Thermometer, 
  ListTodo, 
  Home, 
  MessageSquare, 
  Flag,
  Hourglass,
  Handshake,
  Star,
  ArrowRight,
  Phone,
  Check,
  Pencil
} from 'lucide-react';
import Link from 'next/link';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  // Obtener datos del dashboard
  let metrics: Awaited<ReturnType<typeof getDashboardMetrics>>;
  let recentTasks: Task[];
  let prospectsByStatus: { faseInicial: Prospect[]; enProceso: Prospect[]; faseCierre: Prospect[] };
  let recentInteractions: Interaction[];
  
  try {
    metrics = await getDashboardMetrics();
    recentTasks = await getRecentTasks(5);
    prospectsByStatus = await getProspectsByStatus();
    recentInteractions = await getRecentInteractions(10);
  } catch (error) {
    console.error('Error loading dashboard data:', error);
    // Devolver datos vacíos en lugar de hacer redirect
    metrics = {
      hotProspects: 0,
      hotProspectsAvgScore: 0,
      tasksDue: 0,
      tasksDueToday: 0,
      closedProperties: 0,
      immediateOpportunities: 0,
      interactions: 0,
      interactionsAvgImpact: 0,
    };
    recentTasks = [];
    prospectsByStatus = { faseInicial: [], enProceso: [], faseCierre: [] };
    recentInteractions = [];
  }

  // Función para formatear fechas relativas
  const formatRelativeDate = (dateString: string | null) => {
    if (!dateString) return 'No hay interacciones';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hoy';
    if (diffDays === 1) return 'Hace 1 día';
    return `Hace ${diffDays} días`;
  };

  // Función para formatear fecha completa
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: 'numeric'
    });
  };

  // Función para obtener color del badge según score
  const getScoreColor = (score: number) => {
    if (score >= 70) return 'bg-red-100 text-red-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  // Función para obtener color del badge según impacto
  const getImpactColor = (impact: number) => {
    if (impact >= 70) return 'bg-green-100 text-green-800';
    if (impact >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* BLOQUE A: Fila de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Prospectos Calientes */}
        <Card className="bg-gradient-to-b from-white to-[#ebe6fa] border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Prospectos Calientes / +70%</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{metrics.hotProspects}</p>
                <p className="text-xs text-slate-400">
                  {metrics.hotProspectsAvgScore.toFixed(2)}% score de media
                </p>
              </div>
              <Thermometer className="w-12 h-12 text-[#2bbcd9]" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Tareas a Vencer */}
        <Card className="bg-gradient-to-b from-white to-[#ebe6fa] border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Tareas a vencer / Próximos 7 días</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{metrics.tasksDue}</p>
                <p className="text-xs text-slate-400">
                  {metrics.tasksDueToday} tareas vencen hoy
                </p>
              </div>
              <ListTodo className="w-12 h-12 text-[#2bbcd9]" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Propiedades Cerradas */}
        <Card className="bg-gradient-to-b from-white to-[#ebe6fa] border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Propiedades cerradas / Últimos 3 meses</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{metrics.closedProperties}</p>
                <p className="text-xs text-slate-400">
                  {metrics.immediateOpportunities} oportunidades inmediatas
                </p>
              </div>
              <Home className="w-12 h-12 text-[#2bbcd9]" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Interacciones */}
        <Card className="bg-gradient-to-b from-white to-[#ebe6fa] border border-slate-100 shadow-sm rounded-xl">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-500 mb-1">Interacciones / Últimos 7 días</p>
                <p className="text-4xl font-bold text-slate-900 mb-1">{metrics.interactions}</p>
                <p className="text-xs text-slate-400">
                  +{metrics.interactionsAvgImpact.toFixed(2)}% media de impacto
                </p>
              </div>
              <MessageSquare className="w-12 h-12 text-[#2bbcd9]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLOQUE B: Tareas Pendientes */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-[#2bbcd9]" />
              <h2 className="text-lg font-semibold text-slate-800">Tareas pendientes</h2>
            </div>
            <Link 
              href="/dashboard/tasks" 
              className="text-sm text-[#2bbcd9] hover:text-[#229ab3] hover:underline font-medium transition-colors duration-200"
            >
              Ir a Tareas
            </Link>
          </div>

          <div className="space-y-3">
            {recentTasks.length > 0 ? (
              recentTasks.map((task) => {
                const dueDate = new Date(task.due_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isOverdue = dueDate < today;
                const formattedDate = dueDate.toLocaleDateString('es-ES', { 
                  day: 'numeric', 
                  month: 'short' 
                });

                return (
                  <Card key={task.id} className="border border-slate-100 bg-white rounded-xl hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full font-medium">
                          Pendiente
                        </span>
                        <Phone className="w-4 h-4 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-700 mb-3">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {task.prospect_initials || 'AH'}
                        </div>
                        <span className="text-xs text-slate-600">
                          {task.prospect_name || 'Sin prospecto'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}>
                          {formattedDate} - {isOverdue ? 'Tarea vencida' : dueDate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-2">
                          <button className="p-1 hover:bg-slate-100 rounded transition-colors duration-200">
                            <Check className="w-4 h-4 text-slate-500" />
                          </button>
                          <button className="p-1 hover:bg-slate-100 rounded transition-colors duration-200">
                            <Pencil className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">
                No hay tareas pendientes
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* BLOQUE C: Prospectos Destacados */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-5 h-5 text-[#2bbcd9]" />
            <h2 className="text-lg font-semibold text-slate-800">Prospectos destacados</h2>
          </div>

          {/* Kanban Board */}
          <div className="grid grid-cols-3 gap-4">
            {/* Columna: Fase Inicial */}
            <div className="border-r border-slate-200 pr-4">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-slate-700">Fase Inicial</h3>
              </div>
              <div className="space-y-3">
                {prospectsByStatus.faseInicial.map((prospect) => (
                  <Card key={prospect.id} className="border-l-4 border-blue-500 border border-slate-100 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {prospect.initials}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {prospect.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(prospect.urgency_score)}`}>
                          {prospect.urgency_score.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">
                        Ult. interacción: {formatRelativeDate(prospect.last_interaction_date)}
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        {prospect.total_interactions} Interacciones totales
                      </p>
                      {prospect.cta && (
                        <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2 font-medium">
                          CTA: {prospect.cta}
                        </p>
                      )}
                      <button className="ml-auto flex items-center text-slate-400 hover:text-[#2bbcd9] transition-colors duration-200">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
                {prospectsByStatus.faseInicial.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Sin prospectos
                  </div>
                )}
              </div>
            </div>

            {/* Columna: En Proceso */}
            <div className="border-r border-slate-200 pr-4">
              <div className="flex items-center gap-2 mb-4">
                <Hourglass className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700">En proceso</h3>
              </div>
              <div className="space-y-3">
                {prospectsByStatus.enProceso.map((prospect) => (
                  <Card key={prospect.id} className="border-l-4 border-amber-500 border border-slate-100 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {prospect.initials}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {prospect.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(prospect.urgency_score)}`}>
                          {prospect.urgency_score.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">
                        Ult. interacción: {formatRelativeDate(prospect.last_interaction_date)}
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        {prospect.total_interactions} Interacciones totales
                      </p>
                      {prospect.cta && (
                        <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2 font-medium">
                          CTA: {prospect.cta}
                        </p>
                      )}
                      <button className="ml-auto flex items-center text-slate-400 hover:text-[#2bbcd9] transition-colors duration-200">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
                {prospectsByStatus.enProceso.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Sin prospectos
                  </div>
                )}
              </div>
            </div>

            {/* Columna: Fase de Cierre */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Handshake className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-semibold text-slate-700">Fase de Cierre</h3>
              </div>
              <div className="space-y-3">
                {prospectsByStatus.faseCierre.map((prospect) => (
                  <Card key={prospect.id} className="border-l-4 border-emerald-500 border border-slate-100 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {prospect.initials}
                          </div>
                          <span className="text-sm font-medium text-slate-900">
                            {prospect.name}
                          </span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getScoreColor(prospect.urgency_score)}`}>
                          {prospect.urgency_score.toFixed(2)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mb-1">
                        Ult. interacción: {formatRelativeDate(prospect.last_interaction_date)}
                      </p>
                      <p className="text-xs text-slate-600 mb-2">
                        {prospect.total_interactions} Interacciones totales
                      </p>
                      {prospect.cta && (
                        <p className="text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded mb-2 font-medium">
                          CTA: {prospect.cta}
                        </p>
                      )}
                      <button className="ml-auto flex items-center text-slate-400 hover:text-[#2bbcd9] transition-colors duration-200">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </CardContent>
                  </Card>
                ))}
                {prospectsByStatus.faseCierre.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Sin prospectos
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* BLOQUE D: Últimas Interacciones */}
      <Card className="bg-white border border-slate-100 shadow-sm rounded-xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="w-5 h-5 text-[#2bbcd9]" />
            <h2 className="text-lg font-semibold text-slate-800">Últimas Interacciones</h2>
          </div>

          {recentInteractions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-gray-50">
                    <th className="text-left py-3 px-4 text-xs uppercase font-bold text-gray-500">Prospecto</th>
                    <th className="text-left py-3 px-4 text-xs uppercase font-bold text-gray-500">Tipo</th>
                    <th className="text-left py-3 px-4 text-xs uppercase font-bold text-gray-500">Impacto</th>
                    <th className="text-left py-3 px-4 text-xs uppercase font-bold text-gray-500">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInteractions.map((interaction) => (
                    <tr key={interaction.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-200 min-h-[60px]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {interaction.prospect_initials}
                          </div>
                          <span className="text-sm text-slate-700">{interaction.prospect_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-700">{interaction.type}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getImpactColor(interaction.impact)}`}>
                          {interaction.impact.toFixed(2)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-slate-400">{formatDate(interaction.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              No hay interacciones recientes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
