import { createClient } from '@/lib/supabase/server';
import { differenceInDays, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export interface ProspectDetail {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  score: number;
  status: string;
  substatus?: string;
  last_interaction_date?: string;
  last_interaction_text: string;
  interaction_count: number;
  initials: string;
  avatar_color: string;
  cta_text: string;
}

async function getUserProfile() {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return null;
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, user_id, enterprise_id, role')
    .eq('user_id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
}

function buildBaseFilter(profile: any) {
  const baseFilter: { enterprise_id: string } = {
    enterprise_id: profile.enterprise_id,
  };

  return baseFilter;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '';
}

function getAvatarColor(initials: string): string {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-orange-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-indigo-500',
    'bg-cyan-500',
    'bg-pink-500',
  ];
  const charCode = initials.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
}

function formatLastInteraction(dateString?: string | null): string {
  if (!dateString) {
    return 'No ha habido interacciones';
  }

  try {
    const date = new Date(dateString);
    const daysDiff = differenceInDays(new Date(), date);

    if (daysDiff === 0) {
      return 'Hoy';
    } else if (daysDiff === 1) {
      return 'Hace 1 día';
    } else if (daysDiff <= 7) {
      return `Hace ${daysDiff} días`;
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return 'No ha habido interacciones';
  }
}

const mockProspects = [
  {
    id: '1',
    name: 'Ertha Matiebe',
    email: 'ematiebe1@ihg.com',
    phone: '+86 179 324 7426',
    location: 'Liaocheng, China',
    score: 19.06,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    interaction_count: 1,
  },
  {
    id: '2',
    name: 'Adolfo Herrero',
    email: 'adolfoherrero@gmail.com',
    phone: '674 38 32 47',
    location: 'Madrid, España',
    score: 16.18,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 2,
  },
  {
    id: '3',
    name: 'carolina --',
    email: 'miaticomalaga@yahoo.es',
    phone: '644568886',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '4',
    name: 'Nadine Clementine...',
    email: 'info@lifecoachnadine.be',
    phone: '645710673',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '5',
    name: 'William Cavin',
    email: 'wjcavin@yahoo.com',
    phone: '795107647',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '6',
    name: 'Andreea Marculescu',
    email: 'email@example.com',
    phone: '',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '7',
    name: 'Paola Emilia Gugliotta',
    email: 'paoguglis@gmail.com',
    phone: '667726710',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '8',
    name: 'Artem Rudnevskii',
    email: 'email@example.com',
    phone: '',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '9',
    name: 'Audrey Curran',
    email: 'email@example.com',
    phone: '',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
  {
    id: '10',
    name: 'Robert Haik',
    email: 'robert@haikfamily.com',
    phone: '7862828630',
    location: '-',
    score: 0,
    status: 'Fase inicial',
    substatus: 'Primer contacto',
    last_interaction_date: null,
    interaction_count: 0,
  },
];

export async function getProspects(filters?: {
  query?: string;
  location?: string;
  status?: string | string[];
  scoreRange?: { min: number; max: number };
}): Promise<ProspectDetail[]> {
  try {
    const userProfileData = await getUserProfile();

    if (!userProfileData) {
      console.warn('No user profile found, returning mock prospects');
      return formatProspects(mockProspects);
    }

    const { profile } = userProfileData;
    const supabase = createClient();
    const baseFilter = buildBaseFilter(profile);

    let query = supabase
      .from('prospects')
      .select(`
        id,
        name,
        email,
        phone,
        location,
        score,
        status,
        substatus,
        last_interaction_date,
        created_at,
        interactions (
          count
        )
      `)
      .match(baseFilter);

    if (filters?.status) {
      if (Array.isArray(filters.status) && filters.status.length > 0) {
        query = query.in('status', filters.status);
      } else if (typeof filters.status === 'string') {
        query = query.eq('status', filters.status);
      }
    }

    query = query.order('score', { ascending: false });

    const { data: prospects, error } = await query;

    if (error) {
      console.error('Error fetching prospects:', error);
      return formatProspects(mockProspects);
    }

    if (!prospects || prospects.length === 0) {
      return formatProspects(mockProspects);
    }

    let filteredProspects = (prospects || []) as any[];

    if (filters?.query && filters.query.trim()) {
      const searchQuery = filters.query.toLowerCase().trim();
      filteredProspects = filteredProspects.filter((prospect: any) => {
        const name = prospect.name || '';
        const email = prospect.email || '';
        const phone = prospect.phone || '';

        return (
          name.toLowerCase().includes(searchQuery) ||
          email.toLowerCase().includes(searchQuery) ||
          phone.toLowerCase().includes(searchQuery)
        );
      });
    }

    if (filters?.location && filters.location.trim()) {
      const locationQuery = filters.location.toLowerCase().trim();
      filteredProspects = filteredProspects.filter((prospect: any) => {
        const location = prospect.location || '';
        return location.toLowerCase().includes(locationQuery);
      });
    }

    if (filters?.scoreRange) {
      filteredProspects = filteredProspects.filter((prospect: any) => {
        const score = prospect.score || 0;
        return (
          score >= filters.scoreRange!.min && score <= filters.scoreRange!.max
        );
      });
    }

    return formatProspects(filteredProspects);
  } catch (error) {
    console.error('Error in getProspects:', error);
    return formatProspects(mockProspects);
  }
}

function formatProspects(prospects: any[]): ProspectDetail[] {
  return prospects.map((prospect: any) => ({
    id: prospect.id,
    name: prospect.name || 'Sin nombre',
    email: prospect.email || '',
    phone: prospect.phone || '',
    location: prospect.location || '-',
    score: prospect.score || 0,
    status: prospect.status || 'Fase inicial',
    substatus: prospect.substatus,
    last_interaction_date: prospect.last_interaction_date,
    last_interaction_text: formatLastInteraction(prospect.last_interaction_date),
    interaction_count: prospect.interaction_count || 0,
    initials: getInitials(prospect.name || 'NN'),
    avatar_color: getAvatarColor(getInitials(prospect.name || 'NN')),
    cta_text: prospect.score > 50 ? 'Programar visita para...' : 'No se detectó...',
  }));
}

export async function updateProspect(
  id: string,
  data: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    status?: string;
    substatus?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const userProfileData = await getUserProfile();

    if (!userProfileData) {
      return { success: false, error: 'No authentication' };
    }

    const supabase = createClient();

    const { error } = await supabase
      .from('prospects')
      .update(data)
      .eq('id', id)
      .eq('enterprise_id', userProfileData.profile.enterprise_id);

    if (error) {
      console.error('Error updating prospect:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in updateProspect:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
