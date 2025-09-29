import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { SUPABASE_ACCESS_TOKEN_COOKIE } from '@/features/auth/constants';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Sign in – AESTrak',
};

export default async function LoginPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SUPABASE_ACCESS_TOKEN_COOKIE)?.value;

  if (sessionCookie) {
    redirect('/dashboard');
  }

  return (
    <AuthShell title="Sign in" subtitle="Access your organization dashboard">
      <LoginForm />
    </AuthShell>
  );
}
