import type { Metadata } from 'next';

import { AcceptInviteForm } from '@/features/auth/components/accept-invite-form';
import { AuthShell } from '@/features/auth/components/auth-shell';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Accept invitation – AESTrak',
};

type InviteQueryPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function InviteQueryPage({ searchParams }: InviteQueryPageProps) {
  const tokenParam = searchParams?.token;
  const token = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;

  return (
    <AuthShell title="You're almost in" subtitle="Set your password to join your organization">
      {token ? (
        <AcceptInviteForm token={token} />
      ) : (
        <p className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
          Invitation token missing or expired. Check your email for the latest invite link or
          contact your admin.
        </p>
      )}
    </AuthShell>
  );
}
