import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';
import { getActiveOrganization } from '@/features/organizations/queries';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Sign in – AESTrak',
};

export default async function LoginPage() {
  const activeContext = await getActiveOrganization();

  if (activeContext) {
    redirect('/dashboard');
  }

  return (
    <AuthShell title="Sign in" subtitle="Access your organization dashboard">
      <LoginForm />
    </AuthShell>
  );
}
