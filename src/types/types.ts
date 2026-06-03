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
  meeting_point: string | null;
  latitude: number | null;
  longitude: number | null;
  difficulty: ActivityDifficulty | null;
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

export type CreateActivityPayload = {
  title: string;
  description?: string;

  category_id: number;

  /**
   * Format: HH:MM
   * Example: "09:00"
   */
  starting_hour: string;

  location?: string;

  images?: string[];

  meeting_point?: string;

  latitude?: number;

  longitude?: number;

  difficulty?: ActivityDifficulty;

  duration_minutes?: number;

  base_price: number;

  currency?: string;

  /**
   * 0 = Sunday, 6 = Saturday
   * Example: [1, 3, 5]
   */
  days_of_week: number[];

  min_age?: number;

  max_participants?: number;
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

export type CreateBusinessPayload = {
  business_name: string;
  description?: string;
  contact_email?: string;
  contact_phone?: string;
};
