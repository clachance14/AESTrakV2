'use client';

import { useActionState } from 'react';

import { inviteMemberAction } from '@/features/organizations/actions';
import {
  initialMembersActionState,
  type BaseActionState,
} from '@/features/organizations/form-state';

export function InviteMemberForm() {
  const [state, formAction, isPending] = useActionState<BaseActionState, FormData>(
    inviteMemberAction,
    initialMembersActionState,
  );

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <h2 className="text-lg font-semibold text-foreground">Invite teammates</h2>
        <p className="text-sm text-muted-foreground">
          Send an email invite so teammates can access your organization.
        </p>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium text-foreground" htmlFor="invite-email">
          Work email
        </label>
        <input
          id="invite-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder="teammate@company.com"
          aria-invalid={Boolean(state.fieldErrors?.email)}
          aria-describedby={state.fieldErrors?.email ? 'invite-email-error' : undefined}
          disabled={isPending}
        />
        {state.fieldErrors?.email ? (
          <p id="invite-email-error" className="text-sm text-destructive">
            {state.fieldErrors.email}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          className={
            state.status === 'error' ? 'text-sm text-destructive' : 'text-sm text-emerald-600'
          }
        >
          {state.message}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Sending invite…' : 'Send invite'}
      </button>
    </form>
  );
}
