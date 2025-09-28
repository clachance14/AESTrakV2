'use client';

import { useActionState } from 'react';

import { updateProfileAction } from '@/features/settings/profile/actions';
import {
  initialProfileFormState,
  type ProfileFormState,
} from '@/features/settings/profile/form-state';
import type { UserProfile } from '@/features/settings/profile/queries';

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
];

interface ProfileFormProps {
  profile: UserProfile;
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [state, formAction, isPending] = useActionState<ProfileFormState, FormData>(
    updateProfileAction,
    initialProfileFormState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Profile details</h2>
        <p className="text-sm text-muted-foreground">
          Update how your name appears in the app and share optional contact info for alerts.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="displayName">
            Display name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            defaultValue={profile.displayName ?? ''}
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            aria-invalid={Boolean(state.fieldErrors?.displayName)}
            aria-describedby={state.fieldErrors?.displayName ? 'display-name-error' : undefined}
            disabled={isPending}
          />
          {state.fieldErrors?.displayName ? (
            <p id="display-name-error" className="text-sm text-destructive">
              {state.fieldErrors.displayName}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={profile.email ?? ''}
            readOnly
            className="w-full cursor-not-allowed rounded-md border border-input bg-muted px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Email comes from Supabase Auth. Contact support if you need to change it.
          </p>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="phone">
            Phone (optional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={profile.phone ?? ''}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="+1 555 555 5555"
            aria-invalid={Boolean(state.fieldErrors?.phone)}
            aria-describedby={state.fieldErrors?.phone ? 'phone-error' : undefined}
            disabled={isPending}
          />
          {state.fieldErrors?.phone ? (
            <p id="phone-error" className="text-sm text-destructive">
              {state.fieldErrors.phone}
            </p>
          ) : null}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-foreground" htmlFor="timezone">
            Timezone (optional)
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={profile.timezone ?? ''}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            disabled={isPending}
          >
            <option value="">Select timezone</option>
            {timezones.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>

      {state.formError ? <p className="text-sm text-destructive">{state.formError}</p> : null}
      {state.status === 'success' && state.message ? (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Saving…' : 'Save changes'}
      </button>
    </form>
  );
}
