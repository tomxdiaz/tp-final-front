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

export type Business = {
  id: number;
  app_user_id: string;
  business_name: string;
  description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
};

export type ActivityDifficulty = 'BAJA' | 'MEDIA' | 'ALTA' | 'EXTREMA';

export type Activity = {
  id: number;
  business_id: number;
  title: string;
  description: string | null;
  category_id: number;
  category?: Category;
  starting_hour: string;
  location: string | null;
  images: string[];
  meeting_point: string | null;
  latitude: number | null;
  longitude: number | null;
  difficulty: 'BAJA' | 'MEDIA' | 'ALTA' | 'EXTREMA' | null;
  duration_minutes: number | null;
  base_price: number;
  currency: string;
  days_of_week: number[];
  min_age: number | null;
  max_participants: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};