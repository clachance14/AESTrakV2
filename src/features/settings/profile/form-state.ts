export type ProfileFormState = {
  status: 'idle' | 'success' | 'error';
  message?: string;
  formError?: string;
  fieldErrors?: Partial<Record<'displayName' | 'phone' | 'timezone', string>>;
};

export const initialProfileFormState: ProfileFormState = {
  status: 'idle',
};
