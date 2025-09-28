'use client';

import { useActionState } from 'react';

import { acceptInviteAction } from '@/features/auth/actions';
import { initialAuthState } from '@/features/auth/form-state';

interface AcceptInviteFormProps {
  token: string;
}

export function AcceptInviteForm({ token }: AcceptInviteFormProps) {
  const [state, formAction, isPending] = useActionState(acceptInviteAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="token" value={token} />
      {state.fieldErrors?.token ? (
        <p className="text-sm text-destructive">{state.fieldErrors.token}</p>
      ) : null}

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="email">
            Work email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="you@acme.com"
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

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="password">
            Create password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Create a password"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? 'invite-password-error' : undefined}
            disabled={isPending}
          />
          {state.fieldErrors?.password ? (
            <p id="invite-password-error" className="text-sm text-destructive">
              {state.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="confirmPassword">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Re-enter password"
            aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
            aria-describedby={
              state.fieldErrors?.confirmPassword ? 'invite-confirm-password-error' : undefined
            }
            disabled={isPending}
          />
          {state.fieldErrors?.confirmPassword ? (
            <p id="invite-confirm-password-error" className="text-sm text-destructive">
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>

      {state.formError ? <p className="text-sm text-destructive">{state.formError}</p> : null}

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Accepting invite…' : 'Accept invitation'}
      </button>
    </form>
  );
}
