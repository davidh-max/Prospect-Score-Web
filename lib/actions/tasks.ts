import { createClient } from '@/lib/supabase/server';

export interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  type: string | null;
  priority: string | null;
  prospect_id: string | null;
  prospect_name: string | null;
  prospect_initials: string | null;
  prospect_email: string | null;
  created_by: string;
  created_at: string;
}

export interface TaskStats {
  totalCompleted: number;
  totalPending: number;
  completedLast7Days: number;
  // Alias para compatibilidad
  total?: number;
  pending?: number;
  completedRecent?: number;
}

/**
 * Obtiene el perfil del usuario autenticado (reutilizado de dashboard)
 */
async function getUserProfile() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, enterprise_id, role, rol, first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle();

  // Normalizar el campo role/rol si el perfil existe
  if (profile) {
    const normalized = profile as any;
    if ('rol' in normalized && !('role' in normalized)) {
      normalized.role = normalized.rol;
    }
    profile = normalized;
  }

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
}

/**
 * Construye el filtro base para multi-tenancy y RBAC
 */
function buildBaseFilter(profile: any) {
  const baseFilter: { enterprise_id: string; created_by?: string } = {
    enterprise_id: profile.enterprise_id,
  };

  // Si no es Admin, solo ver sus propios registros
  const userRole = profile.role || profile.rol || 'Agente';
  if (userRole !== 'Admin') {
    baseFilter.created_by = profile.user_id;
  }

  return baseFilter;
}

/**
 * Obtiene las tareas con filtros opcionales
 */
export async function getTasks(filters?: {
  query?: string;
  type?: string;
  priority?: string;
}): Promise<TaskDetail[]> {
  try {
    const userProfileData = await getUserProfile();

    if (!userProfileData) {
      console.warn('No user profile found, returning empty tasks');
      return [];
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);

    // Construir query base
    let query = supabase
      .from('tasks')
      .select(`
        id,
        title,
        description,
        due_date,
        status,
        type,
        priority,
        prospect_id,
        created_by,
        created_at,
        prospects:prospect_id (
          name,
          email
        )
      `)
      .match(baseFilter);

    // Aplicar filtros
    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    // Ordenar por fecha de vencimiento (ascendente)
    query = query.order('due_date', { ascending: true });

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    // Filtrar por texto si se proporciona (búsqueda en memoria)
    let filteredTasks = (tasks || []) as any[];

    if (filters?.query && filters.query.trim()) {
      const searchQuery = filters.query.toLowerCase().trim();
      filteredTasks = filteredTasks.filter((task: any) => {
        const prospect = task.prospects;
        const prospectName = prospect?.name || '';
        const taskTitle = task.title || '';
        const taskDescription = task.description || '';

        return (
          prospectName.toLowerCase().includes(searchQuery) ||
          taskTitle.toLowerCase().includes(searchQuery) ||
          taskDescription.toLowerCase().includes(searchQuery)
        );
      });
    }

    // Formatear las tareas
    return filteredTasks.map((task: any) => {
      const prospect = task.prospects;
      const prospectName = prospect?.name || 'Sin prospecto';
      const initials = prospectName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '';

      return {
        id: task.id,
        title: task.title,
        description: task.description,
        due_date: task.due_date,
        status: task.status || 'Pendiente',
        type: task.type || 'Llamada',
        priority: task.priority || 'Media',
        prospect_id: task.prospect_id,
        prospect_name: prospectName,
        prospect_initials: initials,
        prospect_email: prospect?.email || null,
        created_by: task.created_by,
        created_at: task.created_at,
      };
    });
  } catch (error) {
    console.error('Error in getTasks:', error);
    return [];
  }
}

/**
 * Obtiene las estadísticas de tareas
 */
export async function getTaskStats(): Promise<TaskStats> {
  try {
    const userProfileData = await getUserProfile();

    if (!userProfileData) {
      console.warn('No user profile found, returning empty stats');
      return {
        totalCompleted: 0,
        totalPending: 0,
        completedLast7Days: 0,
        // Alias para compatibilidad
        total: 0,
        pending: 0,
        completedRecent: 0,
      };
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);

    // Total completadas
    const { count: totalCompleted } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .match(baseFilter)
      .eq('status', 'Completada');

    // Total pendientes
    const { count: totalPending } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .match(baseFilter)
      .neq('status', 'Completada');

    // Completadas últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    const { count: completedLast7Days } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .match(baseFilter)
      .eq('status', 'Completada')
      .gte('updated_at', sevenDaysAgoStr);

    return {
      totalCompleted: totalCompleted || 0,
      totalPending: totalPending || 0,
      completedLast7Days: completedLast7Days || 0,
      // Alias para compatibilidad
      total: totalCompleted || 0,
      pending: totalPending || 0,
      completedRecent: completedLast7Days || 0,
    };
  } catch (error) {
    console.error('Error in getTaskStats:', error);
    return {
      totalCompleted: 0,
      totalPending: 0,
      completedLast7Days: 0,
    };
  }
}

