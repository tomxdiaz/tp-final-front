import { useEffect, useState } from 'react';
import { newsletterService } from '../../services/newsletter.service';

const TARGET_DATE = new Date('2026-05-30T10:00:00');

const DEFAULT_BUTTON_TEXT = 'Quiero enterarme';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type ButtonStatus = 'idle' | 'loading' | 'success' | 'error';

function getTimeLeft(): TimeLeft {
  const now = new Date().getTime();
  const target = TARGET_DATE.getTime();
  const difference = target - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

function formatTime(value: number): string {
  return String(value).padStart(2, '0');
}

function getApiMessage(response: unknown): string {
  if (response && typeof response === 'object' && 'message' in response && typeof response.message === 'string') {
    return response.message;
  }

  if (
    response &&
    typeof response === 'object' &&
    'data' in response &&
    response.data &&
    typeof response.data === 'object' &&
    'message' in response.data &&
    typeof response.data.message === 'string'
  ) {
    return response.data.message;
  }

  return 'Suscripción registrada correctamente';
}

function getErrorMessage(error: unknown): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'message' in error.response.data
  ) {
    const message = error.response.data.message;

    if (Array.isArray(message)) {
      return message[0] ?? 'No pudimos registrar tu email';
    }

    if (typeof message === 'string') {
      return message;
    }
  }

  return 'No pudimos registrar tu email';
}

export default function ComingSoon() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>('idle');
  const [buttonMessage, setButtonMessage] = useState(DEFAULT_BUTTON_TEXT);

  const isButtonDisabled = buttonStatus === 'loading' || buttonStatus === 'success' || buttonStatus === 'error';

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  const resetButtonAfterDelay = () => {
    window.setTimeout(() => {
      setButtonStatus('idle');
      setButtonMessage(DEFAULT_BUTTON_TEXT);
    }, 3000);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isButtonDisabled) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email');

    if (!email || typeof email !== 'string') return;

    try {
      setButtonStatus('loading');
      setButtonMessage('Registrando...');

      const res = await newsletterService.subscribe({ email });

      setButtonStatus('success');
      setButtonMessage(getApiMessage(res));

      form.reset();
      resetButtonAfterDelay();
    } catch (error) {
      console.error('Error al suscribir:', error);

      setButtonStatus('error');
      setButtonMessage(getErrorMessage(error));

      resetButtonAfterDelay();
    }
  };

  const buttonClassName = {
    idle: 'bg-teal-600 hover:bg-teal-700',
    loading: 'cursor-not-allowed bg-sage-600',
    success: 'cursor-not-allowed bg-sage-600',
    error: 'cursor-not-allowed bg-red-600',
  }[buttonStatus];

  return (
    <main className='min-h-screen w-full bg-earth-50 text-teal-900'>
      <section className='mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8'>
        <div className='relative h-70 overflow-hidden rounded-3xl shadow-xl sm:h-90 lg:h-107.5'>
          <img src={'./images/banner.jpeg'} alt='Paisaje de montaña y naturaleza outdoor' className='h-full w-full object-cover' />

          <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent' />

          <div className='absolute bottom-0 left-0 right-0 p-6 sm:p-10'>
            <span className='mb-3 inline-flex rounded-full bg-teal-600 px-4 py-1 text-sm font-semibold tracking-wide text-white'>
              Muy pronto
            </span>

            <h1 className='max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>ANDO</h1>

            <p className='mt-3 max-w-2xl text-base leading-7 text-white/90 sm:text-lg'>
              La forma simple de descubrir, comparar y reservar experiencias outdoor en Esquel.
            </p>
          </div>
        </div>

        <div className='grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16'>
          <div>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-teal-600'>
              Turismo outdoor, organizado en un solo lugar
            </p>

            <h2 className='max-w-3xl text-3xl font-bold leading-tight text-teal-900 sm:text-4xl lg:text-5xl'>
              Estamos construyendo una nueva manera de conectar turistas con prestadores locales.
            </h2>

            <p className='mt-6 max-w-2xl text-base leading-8 text-sage-800 sm:text-lg'>
              ANDO nace para resolver un problema concreto: hoy muchas actividades outdoor están dispersas entre Google, Instagram, WhatsApp
              y recomendaciones. Queremos centralizar la información para que encontrar una experiencia sea más rápido, claro y confiable.
            </p>

            <div className='mt-8 grid gap-4 sm:grid-cols-3'>
              {['Explorá actividades', 'Compará opciones', 'Reservá fácil'].map((item) => (
                <div key={item} className='rounded-2xl border border-teal-100 bg-sage-50/80 p-4 shadow-sm backdrop-blur'>
                  <div className='mb-3 h-2 w-10 rounded-full bg-earth-600' />

                  <p className='text-sm font-semibold text-teal-900'>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className='space-y-6'>
            <div className='rounded-3xl border border-teal-100 bg-teal-900 p-6 text-white shadow-xl sm:p-8'>
              <p className='text-center text-sm font-semibold uppercase tracking-[0.25em] text-earth-200'>Tiempo para la carrera</p>

              <div className='mt-6 grid grid-cols-4 gap-3 text-center'>
                <div className='rounded-2xl bg-white/10 p-3 backdrop-blur'>
                  <p className='text-3xl font-bold sm:text-4xl'>{formatTime(timeLeft.days)}</p>
                  <p className='mt-1 text-xs font-medium uppercase tracking-wide text-white/70'>Días</p>
                </div>

                <div className='rounded-2xl bg-white/10 p-3 backdrop-blur'>
                  <p className='text-3xl font-bold sm:text-4xl'>{formatTime(timeLeft.hours)}</p>
                  <p className='mt-1 text-xs font-medium uppercase tracking-wide text-white/70'>Hs</p>
                </div>

                <div className='rounded-2xl bg-white/10 p-3 backdrop-blur'>
                  <p className='text-3xl font-bold sm:text-4xl'>{formatTime(timeLeft.minutes)}</p>
                  <p className='mt-1 text-xs font-medium uppercase tracking-wide text-white/70'>Min</p>
                </div>

                <div className='rounded-2xl bg-white/10 p-3 backdrop-blur'>
                  <p className='text-3xl font-bold sm:text-4xl'>{formatTime(timeLeft.seconds)}</p>
                  <p className='mt-1 text-xs font-medium uppercase tracking-wide text-white/70'>Seg</p>
                </div>
              </div>

              <p className='mt-5 text-center text-sm text-white/70'>30 de mayo de 2026 · 10:00 hs</p>
            </div>

            <div className='rounded-3xl border border-earth-100 bg-white p-6 shadow-xl sm:p-8'>
              <h3 className='text-2xl font-bold text-teal-900'>Sumate antes del lanzamiento</h3>

              <p className='mt-3 text-sm leading-6 text-sage-800'>
                Dejanos tu email y te avisamos cuando ANDO esté disponible. Vamos a compartir novedades, acceso anticipado y las primeras
                experiencias outdoor cargadas en la plataforma.
              </p>

              <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
                <label htmlFor='email' className='block text-sm font-medium text-teal-900'>
                  Email
                </label>

                <input
                  id='email'
                  name='email'
                  type='email'
                  required
                  disabled={isButtonDisabled}
                  placeholder='tuemail@ejemplo.com'
                  className='w-full rounded-2xl border border-teal-100 bg-earth-50 px-4 py-3 text-base text-teal-900 outline-none transition placeholder:text-sage-800/60 disabled:cursor-not-allowed disabled:opacity-70 focus:border-transparent focus:ring-4 focus:ring-teal-600/20'
                />

                <button
                  type='submit'
                  disabled={isButtonDisabled}
                  className={`w-full rounded-2xl px-5 py-3 text-base font-semibold text-white shadow-md transition active:scale-[0.99] disabled:scale-100 ${buttonClassName}`}>
                  {buttonMessage}
                </button>
              </form>

              <p className='mt-4 text-xs leading-5 text-sage-800'>
                Sin spam. Solo novedades importantes sobre el lanzamiento del proyecto.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
