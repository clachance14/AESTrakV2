import { cache } from 'react';

import { createSupabaseServerClient } from '@/libs/supabase/server';

export type UserProfile = {
  id: string;
  email: string | null;
  displayName: string | null;
  phone: string | null;
  timezone: string | null;
};

export const getCurrentUserProfile = cache(async (): Promise<UserProfile | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .select('display_name, phone, timezone')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return {
    id: user.id,
    email: user.email ?? null,
    displayName: profile?.display_name ?? null,
    phone: profile?.phone ?? null,
    timezone: profile?.timezone ?? null,
  };
});
