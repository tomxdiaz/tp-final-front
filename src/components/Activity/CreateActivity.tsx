import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activity.service';
import type { CreateActivityPayload, DifficultyLevel } from '../../types/types';
import ActivityFormStepper, { type FormState } from './ActivityFormStepper';

const CreateActivity = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (form: FormState) => {
    const payload: CreateActivityPayload = {
      title: form.title,
      description: form.description || undefined,
      category_id: form.category_id,
      starting_hour: form.starting_hour,
      location: form.location || undefined,
      images: form.images
        ? form.images
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      meeting_point: form.meeting_point || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      difficulty: (form.difficulty as DifficultyLevel) || undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      base_price: Number(form.base_price),
      currency: form.currency || 'ARS',
      days_of_week: form.days_of_week,
      min_age: form.min_age ? Number(form.min_age) : undefined,
      max_participants: form.max_participants ? Number(form.max_participants) : undefined,
    };

    setIsSubmitting(true);
    activityService
      .createActivity(payload)
      .then(() => navigate('/my-business'))
      .catch((error) => {
        setErrorMessage(error.data?.message || 'Error al crear la actividad');
        setIsSubmitting(false);
      });
  };

  return (
    <ActivityFormStepper
      pageTitle='CREAR ACTIVIDAD'
      submitLabel='Publicar actividad'
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      externalError={errorMessage}
    />
  );
};

export default CreateActivity;
