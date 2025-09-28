'use server';

import { revalidatePath } from 'next/cache';

import type { BaseActionState, MemberRole } from '@/features/organizations/form-state';
import { getSupabaseServiceRoleClient } from '@/libs/supabase/server-client';
import type { Json } from '@/types/database';

import { getActiveOrganization } from './queries';
import type { ActiveOrganizationContext } from './queries';

const emailRegex = /^(?:[a-zA-Z0-9_'.+-]+)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;

type AdminContextResult =
  | { kind: 'error'; state: BaseActionState }
  | { kind: 'context'; context: ActiveOrganizationContext };

async function ensureAdminContext(): Promise<AdminContextResult> {
  const activeContext = await getActiveOrganization();

  if (!activeContext) {
    return {
      kind: 'error',
      state: {
        status: 'error',
        message: 'You must belong to an organization to manage members.',
      },
    };
  }

  if (activeContext.membership.role !== 'admin') {
    return {
      kind: 'error',
      state: {
        status: 'error',
        message: 'Only admins can manage organization members.',
      },
    };
  }

  return {
    kind: 'context',
    context: activeContext,
  };
}

async function recordAuditLog(params: {
  organizationId: string;
  actorId: string;
  entityId: string;
  action: string;
  before?: Json;
  after?: Json;
  context?: Json;
}) {
  const { organizationId, actorId, entityId, action, before, after, context } = params;
  const serviceClient = getSupabaseServiceRoleClient();

  await serviceClient.from('audit_logs').insert({
    organization_id: organizationId,
    entity_type: 'organization_member',
    entity_id: entityId,
    action,
    before: before ?? null,
    after: after ?? null,
    acted_by: actorId,
    context: context ?? null,
  });
}

export async function inviteMemberAction(
  _: BaseActionState,
  formData: FormData,
): Promise<BaseActionState> {
  const email = formData.get('email')?.toString().trim().toLowerCase();

  const fieldErrors: BaseActionState['fieldErrors'] = {};

  if (!email) {
    fieldErrors.email = 'Email is required.';
  } else if (!emailRegex.test(email)) {
    fieldErrors.email = 'Enter a valid email address.';
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      status: 'error',
      fieldErrors,
    };
  }

  const adminContextResult = await ensureAdminContext();

  if (adminContextResult.kind === 'error') {
    return adminContextResult.state;
  }

  const { context } = adminContextResult;
  const serviceClient = getSupabaseServiceRoleClient();
  const targetEmail = email as string;
  const memberRole: MemberRole = 'member';

  const redirectBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const sanitizedBase = redirectBase
    ? redirectBase.endsWith('/')
      ? redirectBase.slice(0, -1)
      : redirectBase
    : undefined;
  const redirectTo = sanitizedBase ? `${sanitizedBase}/invite` : undefined;

  const { data: inviteResult, error: inviteError } =
    await serviceClient.auth.admin.inviteUserByEmail(targetEmail, {
      data: {
        organization_id: context.membership.organizationId,
      },
      redirectTo,
    });

  if (inviteError) {
    return {
      status: 'error',
      message: inviteError.message,
    };
  }

  const invitedUserId = inviteResult?.user?.id;

  if (!invitedUserId) {
    return {
      status: 'error',
      message: 'Failed to create invite. Please try again.',
    };
  }

  const { error: membershipError } = await serviceClient.from('organization_members').upsert(
    {
      organization_id: context.membership.organizationId,
      user_id: invitedUserId,
      role: memberRole,
      status: 'invited',
      joined_at: null,
    },
    { onConflict: 'organization_id,user_id' },
  );

  if (membershipError) {
    return {
      status: 'error',
      message: membershipError.message,
    };
  }

  await recordAuditLog({
    organizationId: context.membership.organizationId,
    actorId: context.userId,
    entityId: invitedUserId,
    action: 'invite_sent',
    after: {
      role: memberRole,
      status: 'invited',
      email: targetEmail,
    },
    context: {
      email: targetEmail,
      invited_via: 'admin_console',
    },
  });

  revalidatePath('/settings/organization');

  return {
    status: 'success',
    message: 'Invitation sent.',
  };
}

export async function removeMemberAction(
  _: BaseActionState,
  formData: FormData,
): Promise<BaseActionState> {
  const userId = formData.get('userId')?.toString();

  if (!userId) {
    return {
      status: 'error',
      fieldErrors: {
        userId: 'Member is required.',
      },
    };
  }

  const adminContextResult = await ensureAdminContext();

  if (adminContextResult.kind === 'error') {
    return adminContextResult.state;
  }

  const { context } = adminContextResult;
  const memberId = userId as string;

  if (context.userId === memberId) {
    return {
      status: 'error',
      message: 'You cannot remove your own membership.',
    };
  }

  const serviceClient = getSupabaseServiceRoleClient();

  const { data: existingMembership, error: existingMembershipError } = await serviceClient
    .from('organization_members')
    .select('role, status')
    .eq('organization_id', context.membership.organizationId)
    .eq('user_id', memberId)
    .single();

  if (existingMembershipError || !existingMembership) {
    return {
      status: 'error',
      message: 'Member not found.',
    };
  }

  if (existingMembership.role === 'admin') {
    const { count: adminCount } = await serviceClient
      .from('organization_members')
      .select('user_id', { count: 'exact', head: true })
      .eq('organization_id', context.membership.organizationId)
      .eq('role', 'admin')
      .eq('status', 'active');

    if ((adminCount ?? 0) <= 1) {
      return {
        status: 'error',
        message: 'Each organization must retain at least one admin.',
      };
    }
  }

  const { error: deleteError } = await serviceClient
    .from('organization_members')
    .delete()
    .eq('organization_id', context.membership.organizationId)
    .eq('user_id', memberId);

  if (deleteError) {
    return {
      status: 'error',
      message: deleteError.message,
    };
  }

  await recordAuditLog({
    organizationId: context.membership.organizationId,
    actorId: context.userId,
    entityId: memberId,
    action: 'member_removed',
    before: { role: existingMembership.role, status: existingMembership.status } as Json,
    context: {
      reason: 'admin_removed',
    },
  });

  revalidatePath('/settings/organization');

  return {
    status: 'success',
    message: 'Member removed.',
  };
}
