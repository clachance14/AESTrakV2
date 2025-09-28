'use server';

import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  AUTH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_MAX_AGE,
  SUPABASE_ACCESS_TOKEN_COOKIE,
  SUPABASE_REFRESH_TOKEN_COOKIE,
} from '@/features/auth/constants';
import type { AuthFormState } from '@/features/auth/form-state';
import { getSupabaseServiceRoleClient } from '@/libs/supabase/server-client';
import type { Database } from '@/types/database';

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and anon key must be configured.');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const cookieSettings = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

const emailRegex = /^(?:[a-zA-Z0-9_'.+-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

function createAnonClient() {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function setSessionCookies(
  accessToken: string,
  refreshToken: string | null | undefined,
  expiresInSeconds: number | null | undefined,
) {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SUPABASE_ACCESS_TOKEN_COOKIE,
    value: accessToken,
    maxAge: expiresInSeconds ?? AUTH_COOKIE_MAX_AGE,
    ...cookieSettings,
  });

  if (refreshToken) {
    cookieStore.set({
      name: SUPABASE_REFRESH_TOKEN_COOKIE,
      value: refreshToken,
      maxAge: REFRESH_COOKIE_MAX_AGE,
      ...cookieSettings,
    });
  }
}

async function clearSessionCookies() {
  const cookieStore = await cookies();

  cookieStore.set({
    name: SUPABASE_ACCESS_TOKEN_COOKIE,
    value: '',
    maxAge: 0,
    ...cookieSettings,
  });

  cookieStore.set({
    name: SUPABASE_REFRESH_TOKEN_COOKIE,
    value: '',
    maxAge: 0,
    ...cookieSettings,
  });
}

function validateEmail(email: string | null | undefined) {
  if (!email) {
    return 'Email is required.';
  }

  if (!emailRegex.test(email.trim().toLowerCase())) {
    return 'Enter a valid email address.';
  }

  return undefined;
}

function validatePassword(password: string | null | undefined, { minLength = 8 } = {}) {
  if (!password) {
    return 'Password is required.';
  }

  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }

  return undefined;
}

export async function signInAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();

  const fieldErrors: AuthFormState['fieldErrors'] = {};

  const emailError = validateEmail(email);
  if (emailError) {
    fieldErrors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    };
  }

  const supabase = createAnonClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email!,
    password: password!,
  });

  if (error || !data.session) {
    return {
      status: 'error',
      formError: error?.message ?? 'Unable to sign in. Please try again.',
    };
  }

  await setSessionCookies(
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in ?? AUTH_COOKIE_MAX_AGE,
  );

  redirect('/dashboard');
}

export async function signUpAction(_: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();
  const organizationName = formData.get('organizationName')?.toString().trim();

  const fieldErrors: AuthFormState['fieldErrors'] = {};

  const emailError = validateEmail(email);
  if (emailError) {
    fieldErrors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = 'Confirm your password.';
  } else if (password && confirmPassword !== password) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  if (!organizationName) {
    fieldErrors.organizationName = 'Organization name is required.';
  } else if (organizationName.length < 2) {
    fieldErrors.organizationName = 'Organization name must be at least 2 characters.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    };
  }

  const supabase = createAnonClient();

  const { data, error } = await supabase.auth.signUp({
    email: email!,
    password: password!,
  });

  if (error || !data.user) {
    return {
      status: 'error',
      formError: error?.message ?? 'Unable to create account. Please try again.',
    };
  }

  const user = data.user;
  const serviceClient = getSupabaseServiceRoleClient();

  const { data: organizationData, error: organizationError } = await serviceClient
    .from('organizations')
    .insert({
      name: organizationName!,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (organizationError || !organizationData) {
    return {
      status: 'error',
      formError: organizationError?.message ?? 'Failed to create organization.',
    };
  }

  const organizationId = organizationData.id;

  const { error: memberError } = await serviceClient.from('organization_members').insert({
    organization_id: organizationId,
    user_id: user.id,
    role: 'admin',
    status: 'active',
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    return {
      status: 'error',
      formError: memberError.message,
    };
  }

  const { error: profileError } = await serviceClient.from('user_profiles').upsert({
    user_id: user.id,
    display_name: organizationName!,
  });

  if (profileError) {
    return {
      status: 'error',
      formError: profileError.message,
    };
  }

  if (!data.session) {
    return {
      status: 'success',
      message: 'Account created. Check your email to confirm the address before signing in.',
    };
  }

  await setSessionCookies(
    data.session.access_token,
    data.session.refresh_token,
    data.session.expires_in ?? AUTH_COOKIE_MAX_AGE,
  );

  redirect('/dashboard');
}

export async function acceptInviteAction(
  _: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const email = formData.get('email')?.toString().trim();
  const password = formData.get('password')?.toString();
  const confirmPassword = formData.get('confirmPassword')?.toString();
  const token = formData.get('token')?.toString().trim();

  const fieldErrors: AuthFormState['fieldErrors'] = {};

  const emailError = validateEmail(email);
  if (emailError) {
    fieldErrors.email = emailError;
  }

  const passwordError = validatePassword(password);
  if (passwordError) {
    fieldErrors.password = passwordError;
  }

  if (!confirmPassword) {
    fieldErrors.confirmPassword = 'Confirm your password.';
  } else if (password && confirmPassword !== password) {
    fieldErrors.confirmPassword = 'Passwords do not match.';
  }

  if (!token) {
    fieldErrors.token = 'Invitation token is missing.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    };
  }

  const supabase = createAnonClient();

  const { data, error } = await supabase.auth.verifyOtp({
    email: email!,
    token: token!,
    type: 'invite',
  });

  if (error || !data.session) {
    return {
      status: 'error',
      formError: error?.message ?? 'Invalid or expired invitation.',
    };
  }

  const currentSession = data.session;

  await supabase.auth.setSession({
    access_token: currentSession.access_token,
    refresh_token: currentSession.refresh_token,
  });

  const { error: updateError } = await supabase.auth.updateUser({
    password: password!,
  });

  if (updateError) {
    return {
      status: 'error',
      formError: updateError.message,
    };
  }

  await setSessionCookies(
    currentSession.access_token,
    currentSession.refresh_token,
    currentSession.expires_in ?? AUTH_COOKIE_MAX_AGE,
  );

  const serviceClient = getSupabaseServiceRoleClient();

  const { error: membershipError } = await serviceClient
    .from('organization_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
    })
    .eq('user_id', currentSession.user.id)
    .eq('status', 'invited');

  if (membershipError) {
    return {
      status: 'error',
      formError: membershipError.message,
    };
  }

  const { error: profileSetupError } = await serviceClient.from('user_profiles').upsert({
    user_id: currentSession.user.id,
  });

  if (profileSetupError) {
    return {
      status: 'error',
      formError: profileSetupError.message,
    };
  }

  redirect('/dashboard');
}

export async function signOutAction() {
  const supabase = createAnonClient();
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(SUPABASE_REFRESH_TOKEN_COOKIE)?.value;

  if (accessToken && refreshToken) {
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
  }

  await supabase.auth.signOut();
  await clearSessionCookies();
  redirect('/login');
}
