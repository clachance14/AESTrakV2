'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { signUpAction } from '@/features/auth/actions';
import { initialAuthState } from '@/features/auth/form-state';

export function SignupForm() {
  const [state, formAction, isPending] = useActionState(signUpAction, initialAuthState);

  const disableForm = isPending || state.status === 'success';

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="organizationName">
            Organization name
          </label>
          <input
            id="organizationName"
            name="organizationName"
            type="text"
            required
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Acme Construction"
            aria-invalid={Boolean(state.fieldErrors?.organizationName)}
            aria-describedby={
              state.fieldErrors?.organizationName ? 'organization-error' : undefined
            }
            disabled={disableForm}
          />
          {state.fieldErrors?.organizationName ? (
            <p id="organization-error" className="text-sm text-destructive">
              {state.fieldErrors.organizationName}
            </p>
          ) : null}
        </div>

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
            aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
            disabled={disableForm}
          />
          {state.fieldErrors?.email ? (
            <p id="email-error" className="text-sm text-destructive">
              {state.fieldErrors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="password">
            Password
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
            aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
            disabled={disableForm}
          />
          {state.fieldErrors?.password ? (
            <p id="password-error" className="text-sm text-destructive">
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
              state.fieldErrors?.confirmPassword ? 'confirm-password-error' : undefined
            }
            disabled={disableForm}
          />
          {state.fieldErrors?.confirmPassword ? (
            <p id="confirm-password-error" className="text-sm text-destructive">
              {state.fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>
      </div>

      {state.formError ? <p className="text-sm text-destructive">{state.formError}</p> : null}
      {state.status === 'success' && state.message ? (
        <p className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-700">{state.message}</p>
      ) : null}

      <button
        type="submit"
        disabled={disableForm}
        className="flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isPending ? 'Creating account…' : 'Create account'}
      </button>

      <div className="text-center text-sm text-muted-foreground">
        Already have access?{' '}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </div>
    </form>
  );
}
