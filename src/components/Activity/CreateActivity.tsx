import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { activityService } from '../../services/activity.service';
import type { ActivityDifficulty, Category, CreateActivityPayload } from '../../types/types';
import { categoryService } from '../../services/category.service';

const CreateActivity = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

  const labelClass = 'text-sm font-medium text-gray-700';

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const payload: CreateActivityPayload = {
      title: formData.get('title') as string,

      description: (formData.get('description') as string) || undefined,

      category_id: Number(formData.get('category_id')),

      starting_hour: formData.get('starting_hour') as string,

      location: (formData.get('location') as string) || undefined,

      images:
        (formData.get('images') as string)
          ?.split(',')
          .map((image) => image.trim())
          .filter(Boolean) || undefined,

      meeting_point: (formData.get('meeting_point') as string) || undefined,

      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : undefined,

      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : undefined,

      difficulty: ((formData.get('difficulty') as string) || undefined) as ActivityDifficulty | undefined,

      duration_minutes: formData.get('duration_minutes') ? Number(formData.get('duration_minutes')) : undefined,

      base_price: Number(formData.get('base_price')),

      currency: (formData.get('currency') as string) || 'ARS',

      days_of_week: formData.getAll('days_of_week').map((day) => Number(day)),

      min_age: formData.get('min_age') ? Number(formData.get('min_age')) : undefined,

      max_participants: formData.get('max_participants') ? Number(formData.get('max_participants')) : undefined,
    };

    if (!payload.category_id) {
      setErrorMessage('Please select a category');
      return;
    }

    if (payload.days_of_week.length === 0) {
      setErrorMessage('Please select at least one day of the week');
      return;
    }

    activityService
      .createActivity(payload)
      .then(() => {
        navigate('/my-activities');
      })
      .catch((error) => {
        setErrorMessage(error.data?.message || 'Error creating activity');
      });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await categoryService.getAllCategories();
        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching all categories:', error.data?.message);
        setCategories([]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className='mx-auto max-w-xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold text-gray-900'>Create Activity</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Title</label>
          <input className={inputClass} type='text' name='title' placeholder='Title' required />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Description</label>
          <input className={inputClass} type='text' name='description' placeholder='Description' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Category</label>
          <select className={inputClass} name='category_id' required defaultValue=''>
            <option value='' disabled>
              Select category
            </option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Starting hour</label>
          <input className={inputClass} type='time' name='starting_hour' required />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Location</label>
          <input className={inputClass} type='text' name='location' placeholder='Location' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Images</label>
          <input className={inputClass} type='text' name='images' placeholder='Images URLs separated by comma' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Meeting point</label>
          <input className={inputClass} type='text' name='meeting_point' placeholder='Meeting Point' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Latitude</label>
          <input className={inputClass} type='number' name='latitude' placeholder='Latitude' step='any' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Longitude</label>
          <input className={inputClass} type='number' name='longitude' placeholder='Longitude' step='any' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Difficulty</label>
          <select className={inputClass} name='difficulty' defaultValue=''>
            <option value=''>Select difficulty</option>
            <option value='BAJA'>Baja</option>
            <option value='MEDIA'>Media</option>
            <option value='ALTA'>Alta</option>
            <option value='EXTREMA'>Extrema</option>
          </select>
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Duration in minutes</label>
          <input className={inputClass} type='number' name='duration_minutes' placeholder='Duration in minutes' min={1} />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Base price</label>
          <input className={inputClass} type='number' name='base_price' placeholder='Base Price' min={0} step='any' required />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Currency</label>
          <input className={inputClass} type='text' name='currency' placeholder='Currency' defaultValue='ARS' />
        </div>

        <fieldset className='flex flex-col gap-2 rounded-md border border-gray-200 p-4'>
          <legend className='px-1 text-sm font-medium text-gray-700'>Days of week</legend>

          {[
            { value: 0, label: 'Sunday' },
            { value: 1, label: 'Monday' },
            { value: 2, label: 'Tuesday' },
            { value: 3, label: 'Wednesday' },
            { value: 4, label: 'Thursday' },
            { value: 5, label: 'Friday' },
            { value: 6, label: 'Saturday' },
          ].map((day) => (
            <label key={day.value} className='flex items-center gap-2 text-sm text-gray-700'>
              <input type='checkbox' name='days_of_week' value={day.value} className='h-4 w-4 rounded border-gray-300' />
              {day.label}
            </label>
          ))}
        </fieldset>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Minimum age</label>
          <input className={inputClass} type='number' name='min_age' placeholder='Minimum age' min={0} />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Max participants</label>
          <input className={inputClass} type='number' name='max_participants' placeholder='Max participants' min={1} />
        </div>

        <button
          type='submit'
          className='mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300'>
          Create Activity
        </button>

        {errorMessage && <p className='rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default CreateActivity;
