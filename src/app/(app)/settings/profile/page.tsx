import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getActiveOrganization } from '@/features/organizations/queries';
import { SettingsTabs } from '@/features/settings/components/settings-tabs';
import { ProfileForm } from '@/features/settings/profile/profile-form';
import { getCurrentUserProfile } from '@/features/settings/profile/queries';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Profile settings – AESTrak',
};

export default async function ProfileSettingsPage() {
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const profile = await getCurrentUserProfile();

  if (!profile) {
    redirect('/login');
  }

  const isAdmin = activeContext.membership.role === 'admin';

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your personal details and organization access.
          </p>
        </div>
        <SettingsTabs currentTab="profile" isAdmin={isAdmin} />
      </div>

      <ProfileForm profile={profile} />
    </div>
  );
}
