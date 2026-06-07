import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Check, Mail, Phone } from 'lucide-react';
import { businessService } from '../../services/business.service';
import type { CreateBusinessPayload } from '../../types/types';

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors bg-white';

const labelClass = 'block text-sm font-semibold text-gray-700 mb-1';

const CreateBusiness = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    business_name: '',
    description: '',
    contact_email: '',
    contact_phone: '',
  });

  useEffect(() => {
    businessService
      .getMyBusiness()
      .then(() => {
        navigate('/my-business', { replace: true });
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  const update = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const handleSubmit = () => {
    if (!form.business_name.trim()) {
      setErrorMessage('El nombre del negocio es requerido');
      return;
    }

    const payload: CreateBusinessPayload = {
      business_name: form.business_name,
      description: form.description || undefined,
      contact_email: form.contact_email || undefined,
      contact_phone: form.contact_phone || undefined,
    };

    setIsSubmitting(true);
    businessService
      .createBusiness(payload)
      .then(() => {
        navigate('/my-business', { replace: true });
      })
      .catch((error) => {
        setErrorMessage(error.data?.message || 'Error al crear el negocio');
        setIsSubmitting(false);
      });
  };

  if (loading) return null;

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-2xl px-4 py-8'>
        <button
          type='button'
          onClick={() => navigate(-1)}
          className='flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 mb-6 transition-colors'>
          <ChevronLeft size={16} />
          Volver al dashboard
        </button>

        <div className='mb-8'>
          <h1 className='font-display text-5xl text-teal-800'>CREAR NEGOCIO</h1>
          <p className='text-sm text-gray-500 mt-1'>Registrá tu emprendimiento para comenzar a publicar actividades</p>
        </div>

        <div className='bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4'>
          <div>
            <label className={labelClass}>
              Nombre del negocio <span className='text-red-500'>*</span>
            </label>
            <input
              className={inputClass}
              type='text'
              placeholder='Ej: Aventuras Patagónicas'
              maxLength={80}
              value={form.business_name}
              onChange={(e) => update('business_name', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Descripción</label>
            <textarea
              className={`${inputClass} min-h-24 resize-none`}
              placeholder='Contá de qué se trata tu negocio, qué experiencias ofrecés...'
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </div>

          <div>
            <label className={labelClass}>Email de contacto</label>
            <div className='relative'>
              <Mail size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                className={`${inputClass} pl-9`}
                type='email'
                placeholder='contacto@minegocio.com'
                value={form.contact_email}
                onChange={(e) => update('contact_email', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Teléfono de contacto</label>
            <div className='relative'>
              <Phone size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
              <input
                className={`${inputClass} pl-9`}
                type='tel'
                placeholder='+54 9 294 000-0000'
                value={form.contact_phone}
                onChange={(e) => update('contact_phone', e.target.value)}
              />
            </div>
          </div>
        </div>

        {errorMessage && (
          <p className='mt-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600'>{errorMessage}</p>
        )}

        <p className='text-xs text-gray-500 mt-4 bg-teal-50 rounded-lg px-4 py-3 border border-teal-100'>
          Tu negocio será revisado por nuestro equipo antes de ser aprobado. Una vez verificado, podrás publicar actividades.
        </p>

        <div className='mt-6'>
          <button
            type='button'
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='w-full flex items-center justify-center gap-2 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'>
            {isSubmitting ? 'Registrando...' : 'Registrar negocio'}
            {!isSubmitting && <Check size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBusiness;
