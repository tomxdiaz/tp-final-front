import { useEffect, useState } from 'react';
import { supabaseService } from '../../services/supabase.service';
import { useNavigate } from 'react-router-dom';

const TARGET_DATE = new Date('2026-05-16T11:00:00');

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

export default function ComingSoon() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>('idle');
  const [buttonMessage, setButtonMessage] = useState(DEFAULT_BUTTON_TEXT);
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const isButtonDisabled = buttonStatus === 'loading' || buttonStatus === 'success';

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

  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isButtonDisabled) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = formData.get('email');

    if (!email || typeof email !== 'string') return;

    setButtonStatus('success');
    setButtonMessage('Registrado!');

    supabaseService
      .subscribe({ email })
      .then((res) => {
        console.log('Suscripción registrada:', res);
      })
      .catch((error) => {
        console.error('Error al suscribir:', error);
      });

    form.reset();

    window.setTimeout(() => {
      setIsPopupOpen(false);
      setButtonStatus('idle');
      setButtonMessage(DEFAULT_BUTTON_TEXT);
    }, 3000);
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
              <img src={'./logos/desafio_capri.png'} alt='Logo Desafío Capri' className='h-20 sm:h-24 md:h-24 w-auto object-cover' />
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
        <div className='relative h-70 overflow-hidden shadow-xl sm:h-50 lg:h-80'>
          <img src={'./images/banner.jpeg'} alt='Paisaje de montaña y naturaleza outdoor' className='h-full w-full object-cover' />

          <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent' />

          <div className='absolute bottom-0 left-0 right-0 p-6 sm:p-10'>
            <div className='flex flex-row items-center gap-4'>
              <img src={'./logos/ando.png'} alt='Logo Ando' className='h-18 sm:h-20 md:h-28 w-auto object-cover' />

              <img src={'./logos/desafio_capri_blanco.png'} alt='Logo Desafío Capri' className='h-18 sm:h-20 md:h-28 w-auto object-cover' />
            </div>

            <p className='mt-3 max-w-2xl text-base leading-7 text-white/90 sm:text-lg'>
              En colaboración con <span className='font-bold italic'>Desafío Capri</span>, presentamos{' '}
              <span className='font-bold italic'>"Ando"</span>, la forma simple de descubrir, comparar y reservar experiencias outdoor en
              Esquel.
            </p>
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-8 p-5 py-6 sm:p-6 lg:px-10 lg:py-12'>
          <div className='mx-auto grid w-full max-w-7xl gap-6 lg:grid-cols-2'>
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col items-center gap-4 rounded-3xl border border-sage-100 bg-teal-800 p-6 text-white shadow-xl sm:p-8'>
                <img src={'./logos/desafio_capri_blanco.png'} alt='Logo Desafío Capri' className='h-32 w-auto object-cover sm:h-38' />

                <div className='w-full'>
                  <p className='text-center text-sm font-semibold uppercase tracking-[0.25em] text-sage-200'>
                    ¿Estás preparado para este desafío?
                  </p>

                  <div className='mt-6 grid grid-cols-4 gap-2 text-center sm:gap-3'>
                    <div className='rounded-2xl bg-white/10 p-2 backdrop-blur sm:p-3'>
                      <p className='text-2xl font-bold sm:text-4xl'>{formatTime(timeLeft.days)}</p>
                      <p className='mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70 sm:text-xs'>Días</p>
                    </div>

                    <div className='rounded-2xl bg-white/10 p-2 backdrop-blur sm:p-3'>
                      <p className='text-2xl font-bold sm:text-4xl'>{formatTime(timeLeft.hours)}</p>
                      <p className='mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70 sm:text-xs'>Hs</p>
                    </div>

                    <div className='rounded-2xl bg-white/10 p-2 backdrop-blur sm:p-3'>
                      <p className='text-2xl font-bold sm:text-4xl'>{formatTime(timeLeft.minutes)}</p>
                      <p className='mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70 sm:text-xs'>Min</p>
                    </div>

                    <div className='rounded-2xl bg-white/10 p-2 backdrop-blur sm:p-3'>
                      <p className='text-2xl font-bold sm:text-4xl'>{formatTime(timeLeft.seconds)}</p>
                      <p className='mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70 sm:text-xs'>Seg</p>
                    </div>
                  </div>

                  <p className='mt-5 text-center text-sm text-white/70'>16 de mayo de 2026 · 11:00 hs</p>
                </div>
              </div>

              <div className='grid gap-3'>
                <div className='rounded-2xl bg-teal-800 p-4 text-white shadow-xl'>
                  <p className='text-sm font-bold'>Llegada y premiación</p>

                  <ul className='mt-3 space-y-2 text-sm leading-6 text-white/85'>
                    <li>
                      <span className='font-semibold text-white'>Llegada:</span> 25 de Mayo y Rivadavia.
                    </li>

                    <li>
                      <span className='font-semibold text-white'>Premiación:</span> 15:00 hs en 25 de Mayo y Rivadavia.
                    </li>

                    <li>La organización podrá modificar horario y/o lugar. Cualquier cambio será informado en la llegada.</li>
                  </ul>
                </div>

                <div className='rounded-2xl border border-earth-200 bg-earth-50 p-4 shadow-xl'>
                  <p className='text-sm font-bold text-teal-900'>Capri Fest</p>

                  <p className='mt-2 text-sm leading-6 text-sage-800'>
                    Comienza a las <span className='font-semibold text-teal-900'>22:00 hs</span> en
                    <span className='font-semibold text-teal-900'> VER Disco Club</span>. Es para corredores y acompañantes, con entrada
                    libre y gratuita.
                  </p>

                  <ul className='mt-3 space-y-2 text-sm leading-6 text-sage-800'>
                    <li>Menores permitidos solo hasta las 00:00 hs.</li>
                    <li>Los corredores participan de los sorteos únicamente si llevan la pulsera del evento entregada en el kit.</li>
                    <li>Los acompañantes no participan de los sorteos.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className='rounded-3xl border border-earth-100 bg-white p-5 shadow-xl sm:p-7'>
              <div className='rounded-2xl bg-earth-50 p-4'>
                <p className='text-xs font-bold uppercase tracking-[0.25em] text-earth-600'>Información importante</p>

                <h3 className='mt-2 text-2xl font-bold leading-tight text-teal-900'>Puntos a tener en cuenta para el Desafío Capri</h3>

                <p className='mt-3 text-sm leading-6 text-sage-800'>
                  La largada será puntual. Recomendamos llegar con tiempo para ingresar al corral, realizar la entrada en calor y evitar
                  inconvenientes con el control de chips.
                </p>
              </div>

              <div className='mt-5 grid gap-3'>
                <div className='rounded-2xl border border-teal-100 bg-teal-50/70 p-4'>
                  <p className='text-sm font-bold text-teal-900'>Largada</p>

                  <p className='mt-1 text-sm leading-6 text-sage-800'>
                    11:00 hs puntual en <span className='font-semibold text-teal-900'>El Tambo</span>. Habrá control de chips, por eso es
                    importante no llegar sobre la hora.
                  </p>
                </div>

                <div className='rounded-2xl border border-teal-100 bg-teal-50/70 p-4'>
                  <p className='text-sm font-bold text-teal-900'>Dorsal obligatorio</p>

                  <p className='mt-1 text-sm leading-6 text-sage-800'>
                    El número de corredor debe estar siempre visible, en el frente y por encima de cualquier prenda.
                    <span className='font-semibold text-red-700'> No debe ir en la espalda.</span> Perder el dorsal implica descalificación.
                  </p>
                </div>

                <div className='rounded-2xl border border-teal-100 bg-teal-50/70 p-4'>
                  <p className='text-sm font-bold text-teal-900'>Hidratación y abastecimiento</p>

                  <p className='mt-1 text-sm leading-6 text-sage-800'>
                    En los puestos de abastecimiento no habrá vasos. Cada corredor deberá llevar su propio soft, botellita, camelbak o
                    sistema de hidratación.
                  </p>
                </div>

                <div className='rounded-2xl border border-teal-100 bg-teal-50/70 p-4'>
                  <p className='text-sm font-bold text-teal-900'>Cuidado del recorrido</p>

                  <p className='mt-1 text-sm leading-6 text-sage-800'>
                    No arrojar basura durante el recorrido. Los sobres de geles, envoltorios y residuos deberán tirarse en los cestos
                    ubicados en cada puesto de abastecimiento.
                  </p>
                </div>

                <div className='rounded-2xl border border-teal-100 bg-teal-50/70 p-4'>
                  <p className='text-sm font-bold text-teal-900'>Marcación del circuito</p>

                  <p className='mt-1 text-sm leading-6 text-sage-800'>
                    Seguir siempre los senderos marcados con cinta flúor. Si durante varios metros no ves cintas, volvé por el mismo camino
                    hasta retomar el recorrido marcado.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className='mx-auto w-full max-w-7xl rounded-3xl border border-teal-100 bg-white p-5 shadow-xl sm:p-7'>
            <p className='mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-teal-600'>
              Turismo outdoor, organizado en un solo lugar
            </p>

            <h2 className='max-w-4xl text-3xl font-bold leading-tight text-teal-900 sm:text-4xl'>
              Estamos construyendo una nueva manera de conectar turistas con prestadores locales.
            </h2>

            <p className='mt-6 max-w-4xl text-base leading-8 text-sage-800 sm:text-lg'>
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
        </div>
      </section>
    </main>
  );
}
