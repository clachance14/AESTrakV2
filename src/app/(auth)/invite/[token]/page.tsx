import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { AcceptInviteForm } from '@/features/auth/components/accept-invite-form';
import { AuthShell } from '@/features/auth/components/auth-shell';

export const metadata: Metadata = {
  title: 'Accept invitation – AESTrak',
};

type InvitePageProps = {
  params: {
    token?: string;
  };
};

export default function InvitePage({ params }: InvitePageProps) {
  const token = params.token;

  if (!token) {
    notFound();
  }

  return (
    <AuthShell title="You're almost in" subtitle="Set your password to join your organization">
      <AcceptInviteForm token={token} />
    </AuthShell>
  );
}
