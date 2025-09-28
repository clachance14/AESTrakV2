import { cache } from 'react';

import { createSupabaseServerClient } from '@/libs/supabase/server';
import { getSupabaseServiceRoleClient } from '@/libs/supabase/server-client';
import type { Database } from '@/types/database';

export type OrganizationMembership = {
  organizationId: string;
  organizationName: string;
  role: Database['public']['Enums']['member_role'];
  status: Database['public']['Enums']['member_status'];
};

export type ActiveOrganizationContext = {
  userId: string;
  userEmail: string | undefined;
  membership: OrganizationMembership;
};

export type OrganizationMemberSummary = {
  userId: string;
  email: string | null;
  displayName: string | null;
  role: Database['public']['Enums']['member_role'];
  status: Database['public']['Enums']['member_status'];
  invitedAt: string;
  joinedAt: string | null;
};

export const getUserMemberships = cache(async () => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (userError.message === 'Auth session missing!') {
      return [] as OrganizationMembership[];
    }

    throw new Error(userError.message);
  }

  if (!user) {
    return [] as OrganizationMembership[];
  }

  const { data, error } = await supabase
    .from('organization_members')
    .select('organization_id, role, status, organizations(name)')
    .eq('user_id', user.id)
    .order('invited_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    data?.map((membership) => ({
      organizationId: membership.organization_id,
      organizationName: membership.organizations?.name ?? 'Organization',
      role: membership.role,
      status: membership.status,
    })) ?? []
  );
});

export const getActiveOrganization = cache(async (): Promise<ActiveOrganizationContext | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    if (userError.message === 'Auth session missing!') {
      return null;
    }

    throw new Error(userError.message);
  }

  if (!user) {
    return null;
  }

  const memberships = await getUserMemberships();
  const activeMembership = memberships.find((membership) => membership.status === 'active');

  if (!activeMembership) {
    return null;
  }

  return {
    userId: user.id,
    userEmail: user.email ?? undefined,
    membership: activeMembership,
  };
});

export async function getOrganizationMembers(
  organizationId: string,
): Promise<OrganizationMemberSummary[]> {
  const serviceClient = getSupabaseServiceRoleClient();
  const { data, error } = await serviceClient
    .from('organization_members')
    .select('user_id, role, status, invited_at, joined_at')
    .eq('organization_id', organizationId)
    .order('invited_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const memberProfilesResponse = await serviceClient
    .from('user_profiles')
    .select('user_id, display_name')
    .in(
      'user_id',
      data.map((member) => member.user_id),
    );

  if (memberProfilesResponse.error) {
    throw new Error(memberProfilesResponse.error.message);
  }

  const profilesByUserId = new Map(
    (memberProfilesResponse.data ?? []).map((profile) => [profile.user_id, profile.display_name]),
  );

  const memberUsers = await Promise.all(
    data.map(async (member) => {
      const { data: userResponse, error: userError } = await serviceClient.auth.admin.getUserById(
        member.user_id,
      );

      if (userError) {
        return {
          userId: member.user_id,
          email: null,
          displayName: profilesByUserId.get(member.user_id) ?? null,
          role: member.role,
          status: member.status,
          invitedAt: member.invited_at,
          joinedAt: member.joined_at,
        } satisfies OrganizationMemberSummary;
      }

      const profile = userResponse?.user;

      return {
        userId: member.user_id,
        email: profile?.email ?? null,
        displayName:
          profilesByUserId.get(member.user_id) ??
          (profile?.user_metadata?.full_name as string | undefined) ??
          null,
        role: member.role,
        status: member.status,
        invitedAt: member.invited_at,
        joinedAt: member.joined_at,
      } satisfies OrganizationMemberSummary;
    }),
  );

  return memberUsers;
}
