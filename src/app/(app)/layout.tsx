import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import { signOutAction } from '@/features/auth/actions';
import { getActiveOrganization } from '@/features/organizations/queries';

export const runtime = 'nodejs';

export default async function AppLayout({ children }: { children: ReactNode }) {
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div>
            <span className="text-lg font-semibold text-foreground">AESTrak</span>
            <p className="text-xs text-muted-foreground">
              {activeContext.membership.organizationName}
            </p>
          </div>
          <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
            <Link href="/dashboard" className="transition hover:text-foreground">
              Dashboard
            </Link>
            <Link href="/purchase-orders" className="transition hover:text-foreground">
              Purchase Orders
            </Link>
            <Link href="/quantity-surveys" className="transition hover:text-foreground">
              Quantity Surveys
            </Link>
            <Link href="/imports" className="transition hover:text-foreground">
              Import
            </Link>
            <Link href="/settings/profile" className="transition hover:text-foreground">
              Settings
            </Link>
          </nav>
          <form action={signOutAction}>
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground transition hover:bg-muted"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
