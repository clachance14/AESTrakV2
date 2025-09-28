export type AuthFormState = {
  status: 'idle' | 'error' | 'success';
  message?: string;
  fieldErrors?: Partial<
    Record<'email' | 'password' | 'confirmPassword' | 'organizationName' | 'token', string>
  >;
  formError?: string;
};

export const initialAuthState: AuthFormState = {
  status: 'idle',
};
