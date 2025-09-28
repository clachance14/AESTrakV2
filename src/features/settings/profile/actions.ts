'use server';

import { revalidatePath } from 'next/cache';

import type { ProfileFormState } from '@/features/settings/profile/form-state';
import { createSupabaseServerClient } from '@/libs/supabase/server';

function normalizeInput(value: FormDataEntryValue | null): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData,
): Promise<ProfileFormState> {
  const displayName = normalizeInput(formData.get('displayName'));
  const phone = normalizeInput(formData.get('phone'));
  const timezone = normalizeInput(formData.get('timezone'));

  const fieldErrors: ProfileFormState['fieldErrors'] = {};

  if (!displayName) {
    fieldErrors.displayName = 'Display name is required.';
  } else if (displayName.length < 2) {
    fieldErrors.displayName = 'Display name must be at least 2 characters.';
  }

  if (phone && phone.length < 7) {
    fieldErrors.phone = 'Enter a valid phone number or leave blank.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      status: 'error',
      formError: userError?.message ?? 'Session expired. Please sign in again.',
    };
  }

  const { error: upsertError } = await supabase.from('user_profiles').upsert({
    user_id: user.id,
    display_name: displayName,
    phone,
    timezone,
  });

  if (upsertError) {
    return {
      status: 'error',
      formError: upsertError.message,
    };
  }

  const { error: metadataError } = await supabase.auth.updateUser({
    data: {
      full_name: displayName,
    },
  });

  if (metadataError) {
    return {
      status: 'error',
      formError: metadataError.message,
    };
  }

  revalidatePath('/settings/profile');

  return {
    status: 'success',
    message: 'Profile updated.',
  };
}
