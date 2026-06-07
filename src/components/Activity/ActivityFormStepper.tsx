import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ChevronRight, ChevronLeft, MapPin, Clock, DollarSign, Users, Image } from 'lucide-react';
import type { DifficultyLevel, Category } from '../../types/types';
import { categoryService } from '../../services/category.service';

const STEPS = [
  { number: 1, label: 'Categoría' },
  { number: 2, label: 'Información' },
  { number: 3, label: 'Detalles' },
  { number: 4, label: 'Imágenes' },
  { number: 5, label: 'Publicar' },
];

const DAYS = [
  { value: 0, label: 'Dom' },
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
];

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'BAJA', label: 'Baja' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'ALTA', label: 'Alta' },
  { value: 'EXTREMA', label: 'Extrema' },
];

const difficultyStyle = (value: DifficultyLevel, selected: boolean): string => {
  const base = 'px-4 py-1.5 rounded-full border text-sm font-semibold cursor-pointer transition-all';
  if (!selected) return `${base} bg-white border-gray-300 text-gray-600 hover:border-teal-400`;
  switch (value) {
    case 'BAJA':
      return `${base} bg-sage-600 border-sage-600 text-white`;
    case 'MEDIA':
      return `${base} bg-teal-800 border-teal-800 text-white`;
    case 'ALTA':
      return `${base} bg-amber-500 border-amber-500 text-white`;
    case 'EXTREMA':
      return `${base} bg-red-500 border-red-500 text-white`;
  }
};

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
  images: string;
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
  images: '',
};

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 transition-colors bg-white';

const labelClass = 'block text-sm font-semibold text-gray-700 mb-1';

interface Props {
  pageTitle: string;
  submitLabel: string;
  initialValues?: Partial<FormState>;
  onSubmit: (form: FormState) => void;
  isSubmitting: boolean;
  externalError?: string;
  disabledFields?: Array<keyof FormState>;
}

const ActivityFormStepper = ({ pageTitle, submitLabel, initialValues, onSubmit, isSubmitting, externalError, disabledFields = [] }: Props) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState<FormState>({ ...emptyForm, ...initialValues });
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    categoryService
      .getAllCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({ ...emptyForm, ...initialValues });
    }
  }, [initialValues]);

  const update = (field: keyof FormState, value: FormState[keyof FormState]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrorMessage('');
  };

  const toggleDay = (day: number) => {
    setForm((prev) => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(day) ? prev.days_of_week.filter((d) => d !== day) : [...prev.days_of_week, day],
    }));
    setErrorMessage('');
  };

  const validateStep = (): string | null => {
    switch (currentStep) {
      case 1:
        if (!form.category_id) return 'Seleccioná una categoría para continuar';
        break;
      case 2:
        if (!form.title.trim()) return 'El nombre de la actividad es requerido';
        if (!form.starting_hour) return 'El horario de inicio es requerido';
        if (form.days_of_week.length === 0) return 'Seleccioná al menos un día de la semana';
        break;
      case 3:
        if (!form.base_price) return 'El precio base es requerido';
        break;
    }
    return null;
  };

  const handleNext = () => {
    const error = validateStep();
    if (error) {
      setErrorMessage(error);
      return;
    }
    setErrorMessage('');
    setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((s) => s - 1);
  };

  const selectedCategory = categories.find((c) => c.id === form.category_id);

  const stepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className='font-display text-4xl text-teal-800 mb-1'>¿QUÉ TIPO DE EXPERIENCIA?</h2>
            <p className='text-sm text-sage-600 mb-6'>Elegí la categoría que mejor describe tu actividad</p>
            <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
              {categories.map((category) => {
                const isSelected = form.category_id === category.id;
                return (
                  <button
                    key={category.id}
                    type='button'
                    onClick={() => update('category_id', category.id)}
                    className={`relative flex items-center justify-center p-5 rounded-xl border-2 cursor-pointer transition-all text-center
                      ${
                        isSelected
                          ? 'border-teal-800 bg-teal-50 shadow-md'
                          : 'border-gray-200 bg-white hover:border-teal-200 hover:bg-teal-50/40'
                      }`}>
                    {isSelected && (
                      <div className='absolute top-2 right-2 w-5 h-5 rounded-full bg-sage-600 flex items-center justify-center'>
                        <Check size={11} className='text-white' />
                      </div>
                    )}
                    <span className={`text-sm font-semibold ${isSelected ? 'text-teal-800' : 'text-gray-700'}`}>{category.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className='font-display text-4xl text-teal-800 mb-1'>INFORMACIÓN BÁSICA</h2>
            <p className='text-sm text-sage-600 mb-6'>Contá tu experiencia de forma atractiva</p>
            <div className='bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4'>
              <div>
                <label className={labelClass}>
                  Nombre de la actividad <span className='text-red-500'>*</span>
                </label>
                <input
                  className={inputClass}
                  type='text'
                  placeholder='Ej: Trekking al cerro López'
                  maxLength={80}
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                />
                <span className='text-xs text-gray-400 mt-1'>{form.title.length}/80 caracteres</span>
              </div>

              <div>
                <label className={labelClass}>Descripción completa</label>
                <textarea
                  className={`${inputClass} min-h-24 resize-none`}
                  placeholder='Describí la experiencia, qué van a hacer, qué deben llevar...'
                  value={form.description}
                  onChange={(e) => update('description', e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Horario de inicio <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <Clock size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                  <input
                    className={`${inputClass} pl-9`}
                    type='time'
                    value={form.starting_hour}
                    onChange={(e) => update('starting_hour', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Días disponibles <span className='text-red-500'>*</span>
                </label>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {DAYS.map((day) => {
                    const active = form.days_of_week.includes(day.value);
                    return (
                      <button
                        key={day.value}
                        type='button'
                        onClick={() => toggleDay(day.value)}
                        className={`px-4 py-1.5 rounded-full border text-sm font-semibold transition-all
                          ${
                            active
                              ? 'bg-teal-800 border-teal-800 text-white'
                              : 'bg-white border-gray-300 text-gray-600 hover:border-teal-400'
                          }`}>
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className='font-display text-4xl text-teal-800 mb-1'>DETALLES TÉCNICOS</h2>
            <p className='text-sm text-sage-600 mb-6'>Información clave para los aventureros</p>
            <div className='bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className={labelClass}>Ubicación</label>
                  <div className='relative'>
                    <MapPin size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className={`${inputClass} pl-9`}
                      type='text'
                      placeholder='Ej: Bariloche, Río Negro'
                      value={form.location}
                      onChange={(e) => update('location', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Punto de encuentro</label>
                  <input
                    className={inputClass}
                    type='text'
                    placeholder='Ej: Estacionamiento del parque'
                    value={form.meeting_point}
                    onChange={(e) => update('meeting_point', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Latitud</label>
                  <input
                    className={inputClass}
                    type='number'
                    placeholder='-41.1335'
                    step='any'
                    value={form.latitude}
                    onChange={(e) => update('latitude', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Longitud</label>
                  <input
                    className={inputClass}
                    type='number'
                    placeholder='-71.3103'
                    step='any'
                    value={form.longitude}
                    onChange={(e) => update('longitude', e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Duración (minutos)</label>
                  <div className='relative'>
                    <Clock size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className={`${inputClass} pl-9`}
                      type='number'
                      placeholder='120'
                      min={1}
                      value={form.duration_minutes}
                      onChange={(e) => update('duration_minutes', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>
                    Precio por persona (ARS) <span className='text-red-500'>*</span>
                  </label>
                  <div className='relative'>
                    <DollarSign size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className={`${inputClass} pl-9`}
                      type='number'
                      placeholder='5000'
                      min={0}
                      step='any'
                      value={form.base_price}
                      onChange={(e) => update('base_price', e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Capacidad máxima</label>
                  <div className='relative'>
                    <Users size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400' />
                    <input
                      className={`${inputClass} pl-9 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed`}
                      type='number'
                      placeholder='20'
                      min={1}
                      disabled={disabledFields.includes('max_participants')}
                      value={form.max_participants}
                      onChange={(e) => update('max_participants', e.target.value)}
                    />
                  </div>
                  {disabledFields.includes('max_participants') && (
                    <p className='text-xs text-gray-400 mt-1'>Este campo no puede modificarse una vez creada la actividad.</p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Edad mínima</label>
                  <input
                    className={inputClass}
                    type='number'
                    placeholder='18'
                    min={0}
                    value={form.min_age}
                    onChange={(e) => update('min_age', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Moneda</label>
                <input
                  className={inputClass}
                  type='text'
                  placeholder='ARS'
                  value={form.currency}
                  onChange={(e) => update('currency', e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass}>Dificultad</label>
                <div className='flex flex-wrap gap-2 mt-1'>
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type='button'
                      onClick={() => update('difficulty', form.difficulty === opt.value ? '' : opt.value)}
                      className={difficultyStyle(opt.value, form.difficulty === opt.value)}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className='font-display text-4xl text-teal-800 mb-1'>IMÁGENES</h2>
            <p className='text-sm text-sage-600 mb-6'>Las fotos son el primer gancho. Usá imágenes de alta calidad.</p>
            <div className='bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-4'>
              <div>
                <label className={labelClass}>URLs de imágenes</label>
                <div className='relative'>
                  <Image size={15} className='absolute left-3 top-3.5 text-gray-400' />
                  <textarea
                    className={`${inputClass} pl-9 min-h-24 resize-none`}
                    placeholder='https://ejemplo.com/foto1.jpg, https://ejemplo.com/foto2.jpg'
                    value={form.images}
                    onChange={(e) => update('images', e.target.value)}
                  />
                </div>
                <p className='text-xs text-gray-400 mt-1.5'>Separalas con comas. La primera imagen será la principal.</p>
              </div>
            </div>
          </div>
        );

      case 5: {
        const selectedDays = DAYS.filter((d) => form.days_of_week.includes(d.value))
          .map((d) => d.label)
          .join(', ');
        const difficultyLabel = DIFFICULTY_OPTIONS.find((o) => o.value === form.difficulty)?.label ?? '—';

        const reviewRow = (label: string, value: string) =>
          value ? (
            <div className='flex justify-between py-3 border-b border-gray-100 last:border-0'>
              <span className='text-sm text-gray-500'>{label}</span>
              <span className='text-sm font-semibold text-gray-800 text-right max-w-[60%]'>{value}</span>
            </div>
          ) : null;

        return (
          <div>
            <h2 className='font-display text-4xl text-teal-800 mb-1'>REVISIÓN FINAL</h2>
            <p className='text-sm text-sage-600 mb-6'>Verificá todo antes de guardar</p>
            <div className='bg-white rounded-xl border border-gray-200 p-5'>
              {selectedCategory && (
                <div className='flex items-center gap-3 pb-4 mb-1 border-b border-gray-100'>
                  <div>
                    <p className='text-xs text-gray-400'>Categoría</p>
                    <p className='font-semibold text-gray-800'>{selectedCategory.name}</p>
                  </div>
                </div>
              )}
              {reviewRow('Título', form.title)}
              {reviewRow('Descripción', form.description)}
              {reviewRow('Horario de inicio', form.starting_hour)}
              {reviewRow('Días disponibles', selectedDays)}
              {reviewRow('Ubicación', form.location)}
              {reviewRow('Punto de encuentro', form.meeting_point)}
              {reviewRow('Duración', form.duration_minutes ? `${form.duration_minutes} min` : '')}
              {reviewRow('Dificultad', difficultyLabel !== '—' ? difficultyLabel : '')}
              {reviewRow('Capacidad máxima', form.max_participants ? `${form.max_participants} personas` : '')}
              {reviewRow('Precio', form.base_price ? `$${form.base_price} ${form.currency}` : '')}
              {reviewRow('Edad mínima', form.min_age ? `${form.min_age} años` : '')}
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='mx-auto max-w-2xl px-4 py-8'>
        {currentStep === 1 && (
          <button
            type='button'
            onClick={() => navigate(-1)}
            className='flex items-center gap-1.5 text-sm text-teal-700 hover:text-teal-900 mb-6 transition-colors'>
            <ChevronLeft size={16} />
            Volver
          </button>
        )}

        <div className='mb-2'>
          <h1 className='font-display text-5xl text-teal-800'>{pageTitle}</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Paso {currentStep} de {STEPS.length} — {STEPS[currentStep - 1].label}
          </p>
        </div>

        <div className='flex items-start justify-between mb-8 mt-6'>
          {STEPS.map((step, index) => (
            <div key={step.number} className='flex items-center flex-1'>
              <div className='flex flex-col items-center gap-1.5 shrink-0'>
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all
                    ${
                      step.number < currentStep
                        ? 'bg-sage-600 text-white'
                        : step.number === currentStep
                          ? 'bg-teal-800 text-white ring-4 ring-teal-100'
                          : 'bg-gray-100 text-gray-400 border border-gray-200'
                    }`}>
                  {step.number < currentStep ? <Check size={15} /> : step.number}
                </div>
                <span
                  className={`text-xs font-medium text-center ${
                    step.number === currentStep ? 'text-teal-800' : step.number < currentStep ? 'text-sage-600' : 'text-gray-400'
                  }`}>
                  {step.label}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 mx-1 mb-5 transition-all ${step.number < currentStep ? 'bg-sage-400' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className='mb-6'>{stepContent()}</div>

        {(errorMessage || externalError) && (
          <p className='mb-4 rounded-lg bg-red-50 border border-red-100 px-4 py-2.5 text-sm text-red-600'>
            {errorMessage || externalError}
          </p>
        )}

        <div className='flex gap-3'>
          {currentStep > 1 && (
            <button
              type='button'
              onClick={handleBack}
              className='flex-1 sm:flex-none sm:w-32 rounded-full border-2 border-teal-800 px-6 py-2.5 text-sm font-semibold text-teal-800 hover:bg-teal-50 transition-colors'>
              Anterior
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              type='button'
              onClick={handleNext}
              className='flex-1 flex items-center justify-center gap-2 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors'>
              Continuar
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type='button'
              onClick={() => onSubmit(form)}
              disabled={isSubmitting}
              className='flex-1 flex items-center justify-center gap-2 rounded-full bg-teal-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed'>
              {isSubmitting ? 'Guardando...' : submitLabel}
              {!isSubmitting && <Check size={16} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFormStepper;
