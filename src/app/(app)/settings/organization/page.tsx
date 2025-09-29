import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { InviteMemberForm } from '@/features/organizations/components/invite-member-form';
import { OrganizationMembersTable } from '@/features/organizations/components/organization-members-table';
import { getActiveOrganization, getOrganizationMembers } from '@/features/organizations/queries';
import { SettingsTabs } from '@/features/settings/components/settings-tabs';

export const metadata: Metadata = {
  title: 'Organization settings – AESTrak',
};

export default async function OrganizationSettingsPage() {
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const isAdmin = activeContext.membership.role === 'admin';

  if (!isAdmin) {
    redirect('/settings/profile');
  }

  const members = await getOrganizationMembers(activeContext.membership.organizationId);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage team access for {activeContext.membership.organizationName}.
          </p>
        </div>
        <SettingsTabs currentTab="organization" isAdmin={isAdmin} />
      </div>

      <InviteMemberForm />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Members</h2>
        <OrganizationMembersTable members={members} currentUserId={activeContext.userId} />
      </div>
    </div>
  );
}
