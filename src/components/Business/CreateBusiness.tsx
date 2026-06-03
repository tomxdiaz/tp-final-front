import { useState } from 'react';
import { businessService } from '../../services/business.service';
import { useNavigate } from 'react-router-dom';

const CreateBusiness = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string>('');

  const inputClass =
    'w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200';

  const labelClass = 'text-sm font-medium text-gray-700';

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    const business_name = formData.get('business_name') as string;
    const description = formData.get('description') as string;
    const contact_email = formData.get('contact_email') as string;
    const contact_phone = formData.get('contact_phone') as string;

    businessService
      .createBusiness({
        business_name,
        description: description || undefined,
        contact_email: contact_email || undefined,
        contact_phone: contact_phone || undefined,
      })
      .then(() => {
        navigate('/dashboard');
      })
      .catch((error) => {
        setErrorMessage(error.data?.message || 'Error creating business');
      });
  };

  return (
    <div className='mx-auto max-w-xl px-4 py-8'>
      <h1 className='mb-6 text-2xl font-bold text-gray-900'>Create Business</h1>

      <form onSubmit={handleSubmit} className='flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm'>
        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Business name</label>
          <input className={inputClass} type='text' name='business_name' placeholder='Business Name' required />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Description</label>
          <input className={inputClass} type='text' name='description' placeholder='Description' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Contact email</label>
          <input className={inputClass} type='email' name='contact_email' placeholder='Contact Email' />
        </div>

        <div className='flex flex-col gap-1'>
          <label className={labelClass}>Contact phone</label>
          <input className={inputClass} type='tel' name='contact_phone' placeholder='Contact Phone' />
        </div>

        <button
          type='submit'
          className='mt-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300'>
          Create Business
        </button>

        {errorMessage && <p className='rounded-md bg-red-50 px-3 py-2 text-sm text-red-700'>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default CreateBusiness;
