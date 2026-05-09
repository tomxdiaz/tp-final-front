import { useEffect, useState } from 'react';
import { newsletterService } from '../../services/newsletter.service';
import { useNavigate } from 'react-router-dom';

const TARGET_DATE = new Date('2026-05-16T10:00:00');

const DEFAULT_BUTTON_TEXT = 'Siguiente';

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
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>('idle');
  const [buttonMessage, setButtonMessage] = useState(DEFAULT_BUTTON_TEXT);
  // cambiar a true para funcionamiento real del popup
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const isButtonDisabled = buttonStatus === 'loading';

  useEffect(() => {
    const timeLeft = getTimeLeft();

    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      navigate('/');
    }

    const intervalId = window.setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [navigate]);

  const resetButtonAfterDelay = () => {
    window.setTimeout(() => {
      setButtonStatus('idle');
      setButtonMessage(DEFAULT_BUTTON_TEXT);
    }, 3000);
  };

  const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {
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
      setIsPopupOpen(false);

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
    success: 'bg-sage-600',
    error: 'bg-red-600',
  }[buttonStatus];

  return (
    <main className='min-h-screen w-full bg-earth-50 text-teal-900'>
      {isPopupOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8'>
            <div className='w-full flex flex-row items-center justify-start gap-2'>
              <img src={'./logos/ando.png'} alt='Logo Ando' className='h-22 sm:h-28 md:h-28 w-auto object-cover' />
              <img src={'./logos/desafio_capri.png'} alt='Logo Desafio Capri' className='h-20 sm:h-24 md:h-24 w-auto object-cover' />
            </div>

            <h2 className='mt-3 text-3xl font-bold text-teal-800'>
              <span className='text-sage-800 italic'>Ando</span> y <span className='text-earth-600 italic'>Desafío Capri</span> te tienen
              una propuesta
            </h2>

            <p className='mt-3 text-sm leading-6 text-sage-800'>
              Dejanos tu email para recibir novedades sobre <span className='text-teal-600 italic font-semibold'>ANDO</span>, la nueva
              plataforma que conecta a turistas con las mejores actividades outdoor de la región.
            </p>

            <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
              <label htmlFor='popup-email' className='block text-sm font-medium text-teal-900'>
                Email
              </label>

              <input
                id='popup-email'
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

            <p className='mt-4 text-xs leading-5 text-sage-800'>Sin spam. Solo novedades importantes sobre el lanzamiento del proyecto.</p>
          </div>
        </div>
      )}

      <section className='mx-auto flex min-h-screen max-w-500 flex-col'>
        <div className='relative h-70 overflow-hidden shadow-xl sm:h-90 lg:h-107.5'>
          <img src={'./images/banner.jpeg'} alt='Paisaje de montaña y naturaleza outdoor' className='h-full w-full object-cover' />

          <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent' />

          <div className='absolute bottom-0 left-0 right-0 p-6 sm:p-10'>
            <div className='flex flex-row items-center gap-4'>
              {/* <h1 className='max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>ANDO</h1> */}
              <img src={'./logos/ando.png'} alt='Logo Ando' className='h-18 sm:h-20 md:h-28 w-auto object-cover' />

              {/* <h1 className='max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>DESAFIO CAPRI</h1> */}
              <img src={'./logos/desafio_capri_blanco.png'} alt='Logo Desafio Capri' className='h-18 sm:h-20 md:h-28 w-auto object-cover' />
            </div>

            <p className='mt-3 max-w-2xl text-base leading-7 text-white/90 sm:text-lg'>
              La forma simple de descubrir, comparar y reservar experiencias outdoor en Esquel.
            </p>
          </div>
        </div>

        <div className='grid flex-1 items-start gap-10 p-6 py-6 lg:grid-cols-[1.1fr_0.9fr] lg:py-16'>
          <div className='order-2 lg:order-1'>
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

          <div className='order-1 space-y-6 lg:order-2'>
            <div className='flex flex-col items-center gap-4 rounded-3xl border border-sage-100 bg-teal-800 p-6 text-white shadow-xl sm:p-8'>
              <img src={'./logos/desafio_capri_blanco.png'} alt='Logo Desafio Capri' className='h-38 w-auto object-cover' />

              <div className='w-full'>
                <p className='text-center text-sm font-semibold uppercase tracking-[0.25em] text-sage-200'>
                  ¿Estás preparado para este desafío?
                </p>

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

                <p className='mt-5 text-center text-sm text-white/70'>16 de mayo de 2026 · 10:00 hs</p>
              </div>
            </div>

            {/* <div className='rounded-3xl border border-earth-100 bg-white p-6 shadow-xl sm:p-8'>
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
            </div> */}
          </div>
        </div>
      </section>
    </main>
  );
}
