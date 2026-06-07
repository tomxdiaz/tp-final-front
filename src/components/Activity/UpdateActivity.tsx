import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { activityService } from '../../services/activity.service';
import type { Activity, DifficultyLevel, UpdateActivityPayload } from '../../types/types';
import ActivityFormStepper from './ActivityFormStepper';
import type { FormState } from './activityForm.types';

const activityToFormValues = (activity: Activity): Partial<FormState> => ({
  category_id: activity.category_id,
  title: activity.title,
  description: activity.description ?? '',
  starting_hour: activity.starting_hour.slice(0, 5),
  days_of_week: activity.days_of_week,
  location: activity.location ?? '',
  meeting_point: activity.meeting_point ?? '',
  latitude: activity.latitude != null ? String(activity.latitude) : '',
  longitude: activity.longitude != null ? String(activity.longitude) : '',
  duration_minutes: activity.duration_minutes != null ? String(activity.duration_minutes) : '',
  difficulty: (activity.difficulty as DifficultyLevel) ?? '',
  base_price: String(activity.base_price),
  currency: activity.currency,
  max_participants: activity.max_participants != null ? String(activity.max_participants) : '',
  min_age: activity.min_age != null ? String(activity.min_age) : '',
  images: [],
  existingImageUrls: activity.images,
});

const UpdateActivity = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loadError, setLoadError] = useState(!id);
  const [isLoading, setIsLoading] = useState(!!id);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    activityService
      .getMyActivityById(Number(id))
      .then((data) => {
        setActivity(data);
        setIsLoading(false);
      })
      .catch(() => {
        setLoadError(true);
        setIsLoading(false);
      });
  }, [id]);

  const handleSubmit = (form: FormState) => {
    if (!id) return;

    const payload: UpdateActivityPayload = {
      title: form.title || undefined,
      description: form.description || undefined,
      category_id: form.category_id || undefined,
      starting_hour: form.starting_hour || undefined,
      location: form.location || undefined,
      meeting_point: form.meeting_point || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      difficulty: (form.difficulty as DifficultyLevel) || undefined,
      duration_minutes: form.duration_minutes ? Number(form.duration_minutes) : undefined,
      base_price: form.base_price ? Number(form.base_price) : undefined,
      currency: form.currency || undefined,
      days_of_week: form.days_of_week.length ? form.days_of_week : undefined,
      min_age: form.min_age ? Number(form.min_age) : undefined,
      existingImages: form.existingImageUrls,
      images: form.images.length ? form.images : undefined,
    };

    setIsSubmitting(true);
    activityService
      .updateActivity(Number(id), payload)
      .then(() => navigate('/my-business'))
      .catch((error) => {
        setErrorMessage(error.data?.message || 'Error al actualizar la actividad');
        setIsSubmitting(false);
      });
  };

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <p className='text-gray-500 text-sm'>Cargando actividad...</p>
      </div>
    );
  }

  if (loadError || !activity) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
        <div className='text-center max-w-sm'>
          <p className='font-display text-3xl text-teal-800 mb-2'>ACTIVIDAD NO ENCONTRADA</p>
          <p className='text-sm text-gray-500 mb-6'>
            No encontramos esa actividad en tu negocio. Puede que no exista o no te pertenezca.
          </p>
          <button
            type='button'
            onClick={() => navigate('/my-business')}
            className='rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors'>
            Volver a mi negocio
          </button>
        </div>
      </div>
    );
  }

  return (
    <ActivityFormStepper
      pageTitle='EDITAR ACTIVIDAD'
      submitLabel='Guardar cambios'
      initialValues={activityToFormValues(activity)}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      externalError={errorMessage}
      disabledFields={['max_participants']}
    />
  );
};

export default UpdateActivity;
