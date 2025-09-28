'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { signInAction } from '@/features/auth/actions';
import { initialAuthState } from '@/features/auth/form-state';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialAuthState);

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-foreground" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="name@company.com"
            aria-invalid={Boolean(state.fieldErrors?.email)}
            aria-describedby={state.fieldErrors?.email ? 'email-error' : undefined}
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
            autoComplete="current-password"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Enter your password"
            aria-invalid={Boolean(state.fieldErrors?.password)}
            aria-describedby={state.fieldErrors?.password ? 'password-error' : undefined}
          />
          {state.fieldErrors?.password ? (
            <p id="password-error" className="text-sm text-destructive">
              {state.fieldErrors.password}
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
        {isPending ? 'Signing in…' : 'Sign in'}
      </button>

      <div className="text-center text-sm text-muted-foreground">
        Need an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Create one
        </Link>
      </div>
    </form>
  );
}
