import type { Metadata } from 'next';

import { AuthShell } from '@/features/auth/components/auth-shell';
import { SignupForm } from '@/features/auth/components/signup-form';

export const metadata: Metadata = {
  title: 'Create account – AESTrak',
};

export default function SignupPage() {
  return (
    <AuthShell title="Create your admin account" subtitle="Set up your organization in a few steps">
      <SignupForm />
    </AuthShell>
  );
}
