import type { Database } from '@/types/database';

export type MemberRole = Database['public']['Enums']['member_role'];

export type BaseActionState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Partial<Record<'email' | 'userId', string>>;
};

export const initialMembersActionState: BaseActionState = {
  status: 'idle',
};
