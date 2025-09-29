import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { getActiveOrganization } from '@/features/organizations/queries';
import { SettingsTabs } from '@/features/settings/components/settings-tabs';
import { getSupabaseServiceRoleClient } from '@/libs/supabase/server-client';

export const runtime = 'nodejs';

export const metadata: Metadata = {
  title: 'Billing settings – AESTrak',
};

export default async function BillingSettingsPage() {
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  const isAdmin = activeContext.membership.role === 'admin';

  if (!isAdmin) {
    redirect('/settings/profile');
  }

  const serviceClient = getSupabaseServiceRoleClient();
  const { data: organization } = await serviceClient
    .from('organizations')
    .select('name, plan')
    .eq('id', activeContext.membership.organizationId)
    .single();

  const planLabel = organization?.plan
    ? organization.plan.replace(/\b\w/g, (char) => char.toUpperCase())
    : 'Essential';

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Review your current plan and billing instructions.
          </p>
        </div>
        <SettingsTabs currentTab="billing" isAdmin={isAdmin} />
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground">Current plan</h2>
          <p className="text-sm text-muted-foreground">
            {organization?.name ?? 'Organization'} is on the {planLabel} plan.
          </p>
        </section>

        <section className="rounded-lg border border-dashed border-border bg-card/60 p-6">
          <h3 className="text-base font-semibold text-foreground">Manual billing</h3>
          <p className="text-sm text-muted-foreground">
            Until Stripe automation is live, email{' '}
            <a className="font-medium text-primary" href="mailto:billing@aestrak.com">
              billing@aestrak.com
            </a>{' '}
            with your purchase order number to update seats or request invoices.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Need changes fast? Include your requested go-live date and we will confirm within one
            business day.
          </p>
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-md border border-border px-4 py-2 text-sm font-medium text-muted-foreground"
            disabled
          >
            Stripe portal coming soon
          </button>
        </section>
      </div>
    </div>
  );
}
