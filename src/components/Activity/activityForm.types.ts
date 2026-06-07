import type { DifficultyLevel } from '../../types/types';

export interface FormState {
  category_id: number;
  title: string;
  description: string;
  starting_hour: string;
  days_of_week: number[];
  location: string;
  meeting_point: string;
  latitude: string;
  longitude: string;
  duration_minutes: string;
  difficulty: DifficultyLevel | '';
  base_price: string;
  currency: string;
  max_participants: string;
  min_age: string;
  images: File[];
  existingImageUrls: string[];
}

export const emptyForm: FormState = {
  category_id: 0,
  title: '',
  description: '',
  starting_hour: '',
  days_of_week: [],
  location: '',
  meeting_point: '',
  latitude: '',
  longitude: '',
  duration_minutes: '',
  difficulty: '',
  base_price: '',
  currency: 'ARS',
  max_participants: '',
  min_age: '',
  images: [],
  existingImageUrls: [],
};
