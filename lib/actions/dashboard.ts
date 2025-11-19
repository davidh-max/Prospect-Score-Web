import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export interface DashboardMetrics {
  hotProspects: number;
  hotProspectsAvgScore: number;
  tasksDue: number;
  tasksDueToday: number;
  closedProperties: number;
  immediateOpportunities: number;
  interactions: number;
  interactionsAvgImpact: number;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  due_date: string;
  status: string;
  prospect_id: string | null;
  prospect_name: string | null;
  prospect_initials: string | null;
  created_by: string;
}

export interface Prospect {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  urgency_score: number;
  last_interaction_date: string | null;
  total_interactions: number;
  cta: string | null;
  initials: string;
}

export interface Interaction {
  id: string;
  type: string;
  impact: number;
  created_at: string;
  prospect_id: string;
  prospect_name: string;
  prospect_initials: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  enterprise_id: string;
  role: 'Admin' | 'Agente';
  first_name: string | null;
  last_name: string | null;
}

/**
 * Obtiene el perfil del usuario autenticado con validación de seguridad
 * Implementa auto-healing: crea el perfil y empresa si no existen
 * NO hace redirect - devuelve null si no hay usuario o perfil
 */
async function getUserProfile(): Promise<{ user: any; profile: UserProfile } | null> {
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

  // Auto-healing: Si no existe el perfil, crearlo automáticamente
  if (profileError || !profile) {
    // Obtener datos del usuario desde metadata (si vienen del signup)
    const userMetadata = user.user_metadata || {};
    const firstName = userMetadata.first_name || userMetadata.firstName || 'Usuario';
    const lastName = userMetadata.last_name || userMetadata.lastName || 'Nuevo';
    const companyName = userMetadata.company_name || userMetadata.companyName || 'Mi Empresa';

    // 1. Obtener o usar enterprise_id (simplificado para evitar problemas de RLS)
    // Usar user_id como enterprise_id por defecto para evitar problemas de permisos
    let enterpriseId: string = user.id;

    // Intentar buscar si ya existe una empresa (sin crear, solo leer)
    try {
      const { data: existingEnterprise } = await supabase
        .from('enterprises')
        .select('id')
        .limit(1)
        .maybeSingle();

      if (existingEnterprise?.id) {
        enterpriseId = existingEnterprise.id;
      }
    } catch (error) {
      // Si no se puede acceder a enterprises, usar user_id
      console.warn('Could not access enterprises table, using user_id as enterprise_id');
      enterpriseId = user.id;
    }

    // 2. Crear el perfil
    try {
      // Intentar primero con 'role' (nombre en inglés)
      const profileData: any = {
        user_id: user.id,
        enterprise_id: enterpriseId,
        role: 'Admin', // Primer usuario es Admin
        first_name: firstName,
        last_name: lastName,
        created_at: new Date().toISOString(),
      };

      // Intentar insertar sin id primero
      let { data: newProfile, error: createProfileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select('id, user_id, enterprise_id, role, rol, first_name, last_name')
        .single();

      // Normalizar si se creó exitosamente
      if (newProfile) {
        const normalized = newProfile as any;
        if ('rol' in normalized && !('role' in normalized)) {
          normalized.role = normalized.rol;
        }
        newProfile = normalized;
      }

      // Si falla, intentar con 'rol' (nombre en español) o con id explícito
      if (createProfileError) {
        // Intentar con 'rol' en lugar de 'role'
        const profileDataRol: any = {
          ...profileData,
          rol: profileData.role,
        };
        delete profileDataRol.role;

        let retryResult = await supabase
          .from('profiles')
          .insert(profileDataRol)
          .select('id, user_id, enterprise_id, rol, first_name, last_name')
          .single();

        if (retryResult.error) {
          // Si aún falla, intentar con id explícito
          profileData.id = user.id;
          retryResult = await supabase
            .from('profiles')
            .insert(profileData)
            .select('id, user_id, enterprise_id, role, first_name, last_name')
            .single();
        }

        if (retryResult.data) {
          // Normalizar el campo role/rol del resultado
          const normalized = retryResult.data as any;
          if ('rol' in normalized && !('role' in normalized)) {
            normalized.role = normalized.rol;
          }
          newProfile = normalized;
        }
        createProfileError = retryResult.error;
      }

      if (createProfileError || !newProfile) {
        console.error('Error creating profile:', createProfileError);
        // Si aún falla, intentar obtener el perfil nuevamente (por si se creó en otro proceso)
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('id, user_id, enterprise_id, role, rol, first_name, last_name')
          .eq('user_id', user.id)
          .maybeSingle();

        if (retryProfile) {
          // Normalizar el campo role/rol
          const normalizedProfile: any = {
            ...retryProfile,
            role: (retryProfile as any).role || (retryProfile as any).rol || 'Admin',
          };
          if ('rol' in normalizedProfile && !('role' in normalizedProfile)) {
            normalizedProfile.role = normalizedProfile.rol;
          }
          profile = normalizedProfile;
        } else {
          // Si no se puede crear, devolver null (no hacer redirect)
          console.error('Could not create or retrieve profile, returning null');
          return null;
        }
      } else {
        // Normalizar el campo role/rol
        const normalizedProfile: any = {
          ...newProfile,
          role: (newProfile as any).role || (newProfile as any).rol || 'Admin',
        };
        if ('rol' in normalizedProfile && !('role' in normalizedProfile)) {
          normalizedProfile.role = normalizedProfile.rol;
        }
        profile = normalizedProfile;
      }
    } catch (error) {
      console.error('Error in profile creation:', error);
      // En caso de error, devolver null (no hacer redirect)
      return null;
    }
  }

  return { user, profile: profile as UserProfile };
}

/**
 * Construye el filtro base para multi-tenancy y RBAC
 */
function buildBaseFilter(profile: UserProfile) {
  const baseFilter: { enterprise_id: string; created_by?: string } = {
    enterprise_id: profile.enterprise_id,
  };

  // Si no es Admin, solo ver sus propios registros
  const userRole = (profile as any).role || (profile as any).rol || 'Agente';
  if (userRole !== 'Admin') {
    baseFilter.created_by = profile.user_id;
  }

  return baseFilter;
}

/**
 * Obtiene las métricas principales del dashboard
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const userProfileData = await getUserProfile();
    
    // Si no hay perfil, devolver métricas en cero
    if (!userProfileData) {
      console.warn('No user profile found, returning empty metrics');
      return {
        hotProspects: 0,
        hotProspectsAvgScore: 0,
        tasksDue: 0,
        tasksDueToday: 0,
        closedProperties: 0,
        immediateOpportunities: 0,
        interactions: 0,
        interactionsAvgImpact: 0,
      };
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);

  // 1. Prospectos Calientes (status = 'Fase de cierre' y urgency_score > 70)
  const { count: hotProspectsCount, data: hotProspectsData } = await supabase
    .from('prospects')
    .select('urgency_score', { count: 'exact', head: false })
    .match(baseFilter)
    .eq('status', 'Fase de cierre')
    .gt('urgency_score', 70);

  const hotProspects = hotProspectsCount || 0;
  const hotProspectsAvgScore = hotProspectsData && hotProspectsData.length > 0
    ? hotProspectsData.reduce((sum, p) => sum + (p.urgency_score || 0), 0) / hotProspectsData.length
    : 0;

  // 2. Tareas a vencer (due_date <= hoy y status != 'Completada')
  const today = new Date().toISOString().split('T')[0];
  const { count: tasksDueCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .match(baseFilter)
    .lte('due_date', today)
    .neq('status', 'Completada');

  const { count: tasksDueTodayCount } = await supabase
    .from('tasks')
    .select('*', { count: 'exact', head: true })
    .match(baseFilter)
    .eq('due_date', today)
    .neq('status', 'Completada');

  // 3. Propiedades cerradas (últimos 3 meses)
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  const threeMonthsAgoStr = threeMonthsAgo.toISOString().split('T')[0];

  const { count: closedPropertiesCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .match(baseFilter)
    .eq('status', 'Vendida')
    .gte('closed_at', threeMonthsAgoStr);

  const { count: immediateOpportunitiesCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .match(baseFilter)
    .eq('status', 'Vendida')
    .eq('closed_at', today);

  // 4. Interacciones (últimos 7 días)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

  const { count: interactionsCount, data: interactionsData } = await supabase
    .from('interactions')
    .select('impact', { count: 'exact', head: false })
    .match(baseFilter)
    .gte('created_at', sevenDaysAgoStr);

  const interactions = interactionsCount || 0;
  const interactionsAvgImpact = interactionsData && interactionsData.length > 0
    ? interactionsData.reduce((sum, i) => sum + (i.impact || 0), 0) / interactionsData.length
    : 0;

    return {
      hotProspects,
      hotProspectsAvgScore,
      tasksDue: tasksDueCount || 0,
      tasksDueToday: tasksDueTodayCount || 0,
      closedProperties: closedPropertiesCount || 0,
      immediateOpportunities: immediateOpportunitiesCount || 0,
      interactions,
      interactionsAvgImpact,
    };
  } catch (error) {
    console.error('Error in getDashboardMetrics:', error);
    // Devolver métricas en cero en caso de error
    return {
      hotProspects: 0,
      hotProspectsAvgScore: 0,
      tasksDue: 0,
      tasksDueToday: 0,
      closedProperties: 0,
      immediateOpportunities: 0,
      interactions: 0,
      interactionsAvgImpact: 0,
    };
  }
}

/**
 * Obtiene las tareas pendientes más próximas a vencer
 */
export async function getRecentTasks(limit: number = 5): Promise<Task[]> {
  try {
    const userProfileData = await getUserProfile();
    
    // Si no hay perfil, devolver array vacío
    if (!userProfileData) {
      console.warn('No user profile found, returning empty tasks');
      return [];
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);
    const today = new Date().toISOString().split('T')[0];

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select(`
      id,
      title,
      description,
      due_date,
      status,
      prospect_id,
      created_by,
      prospects:prospect_id (
        name,
        email
      )
    `)
      .match(baseFilter)
      .neq('status', 'Completada')
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }

    return (tasks || []).map((task: any) => {
      const prospect = task.prospects;
      const prospectName = prospect?.name || '';
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
        status: task.status,
        prospect_id: task.prospect_id,
        prospect_name: prospectName,
        prospect_initials: initials,
        created_by: task.created_by,
      };
    });
  } catch (error) {
    console.error('Error in getRecentTasks:', error);
    return [];
  }
}

/**
 * Obtiene prospectos agrupados por status para el Kanban
 */
export async function getProspectsByStatus(): Promise<{
  faseInicial: Prospect[];
  enProceso: Prospect[];
  faseCierre: Prospect[];
}> {
  try {
    const userProfileData = await getUserProfile();
    
    // Si no hay perfil, devolver arrays vacíos
    if (!userProfileData) {
      console.warn('No user profile found, returning empty prospects');
      return { faseInicial: [], enProceso: [], faseCierre: [] };
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);

    const { data: prospects, error } = await supabase
      .from('prospects')
      .select(`
      id,
      name,
      email,
      phone,
      status,
      urgency_score,
      created_at,
      interactions:prospect_id (
        created_at,
        impact
      )
    `)
      .match(baseFilter)
      .order('urgency_score', { ascending: false });

    if (error) {
      console.error('Error fetching prospects:', error);
      return { faseInicial: [], enProceso: [], faseCierre: [] };
    }

    const formatProspect = (p: any): Prospect => {
      const interactions = p.interactions || [];
      const lastInteraction = interactions.length > 0
        ? interactions.sort((a: any, b: any) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )[0]
        : null;

      const initials = p.name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '';

      // Obtener CTA de la última interacción o tarea relacionada
      const cta = lastInteraction?.cta || null;

      return {
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        status: p.status,
        urgency_score: p.urgency_score || 0,
        last_interaction_date: lastInteraction?.created_at || null,
        total_interactions: interactions.length,
        cta,
        initials,
      };
    };

    const faseInicial = (prospects || [])
      .filter((p: any) => p.status === 'Fase Inicial')
      .map(formatProspect);

    const enProceso = (prospects || [])
      .filter((p: any) => p.status === 'En proceso')
      .map(formatProspect);

    const faseCierre = (prospects || [])
      .filter((p: any) => p.status === 'Fase de cierre')
      .map(formatProspect);

    return { faseInicial, enProceso, faseCierre };
  } catch (error) {
    console.error('Error in getProspectsByStatus:', error);
    return { faseInicial: [], enProceso: [], faseCierre: [] };
  }
}

/**
 * Obtiene las últimas interacciones para el dashboard
 */
export async function getRecentInteractions(limit: number = 10): Promise<Interaction[]> {
  try {
    const userProfileData = await getUserProfile();
    
    // Si no hay perfil, devolver array vacío
    if (!userProfileData) {
      console.warn('No user profile found, returning empty interactions');
      return [];
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);

    const { data: interactions, error } = await supabase
      .from('interactions')
      .select(`
        id,
        type,
        impact,
        created_at,
        prospect_id,
        prospects:prospect_id (
          name
        )
      `)
      .match(baseFilter)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching interactions:', error);
      return [];
    }

    return (interactions || []).map((interaction: any) => {
      const prospect = interaction.prospects;
      const prospectName = prospect?.name || 'Sin prospecto';
      const initials = prospectName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '';

      return {
        id: interaction.id,
        type: interaction.type || 'Sin tipo',
        impact: interaction.impact || 0,
        created_at: interaction.created_at,
        prospect_id: interaction.prospect_id,
        prospect_name: prospectName,
        prospect_initials: initials,
      };
    });
  } catch (error) {
    console.error('Error in getRecentInteractions:', error);
    return [];
  }
}

