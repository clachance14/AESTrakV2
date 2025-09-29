import type { Metadata } from 'next';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Sign in – AESTrak',
};

export default function LoginPage() {
  return (
    <AuthShell title="Sign in" subtitle="Access your organization dashboard">
      <LoginForm />
    </AuthShell>
  );
}
