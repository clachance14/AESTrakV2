'use client';

import { useActionState } from 'react';

import { removeMemberAction } from '@/features/organizations/actions';
import {
  initialMembersActionState,
  type BaseActionState,
} from '@/features/organizations/form-state';

type MemberActionsProps = {
  userId: string;
  disableRemoval: boolean;
};

export function MemberActions({ userId, disableRemoval }: MemberActionsProps) {
  const [removeState, submitRemove, removePending] = useActionState<BaseActionState, FormData>(
    removeMemberAction,
    initialMembersActionState,
  );

  const isRemoveDisabled = disableRemoval || removePending;

  return (
    <div className="space-y-2">
      <form action={submitRemove} className="flex items-center gap-2">
        <input type="hidden" name="userId" value={userId} />
        <button
          type="submit"
          disabled={isRemoveDisabled}
          className="rounded-md border border-destructive px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {removePending ? 'Removing…' : 'Remove'}
        </button>
      </form>
      {removeState.status === 'error' && removeState.message ? (
        <p className="text-xs text-destructive">{removeState.message}</p>
      ) : null}
    </div>
  );
}
