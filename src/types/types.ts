export type AppRole = 'USER' | 'SUPER_USER';

export type AppUser = {
  id: string;
  email: string;
  global_role: AppRole;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
};
