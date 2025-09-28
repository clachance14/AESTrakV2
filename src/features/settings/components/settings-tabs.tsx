import Link from 'next/link';

const tabs = [
  { key: 'profile', label: 'Profile', href: '/settings/profile' },
  { key: 'organization', label: 'Organization', href: '/settings/organization' },
  { key: 'billing', label: 'Billing', href: '/settings/billing' },
] as const;

export type SettingsTabKey = (typeof tabs)[number]['key'];

interface SettingsTabsProps {
  currentTab: SettingsTabKey;
  isAdmin: boolean;
}

const adminOnlyTabs = new Set<SettingsTabKey>(['organization', 'billing']);

export function SettingsTabs({ currentTab, isAdmin }: SettingsTabsProps) {
  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        if (adminOnlyTabs.has(tab.key) && !isAdmin) {
          return null;
        }

        const isActive = tab.key === currentTab;

        return (
          <Link
            key={tab.key}
            href={tab.href}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              isActive
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:text-foreground'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
