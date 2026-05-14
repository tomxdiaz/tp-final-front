import { useEffect, useState } from 'react';
import { Flag, Trophy, Music, MapPin, Navigation, TriangleAlert, Calendar, Compass, Leaf, Droplet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseService } from '../../services/supabase.service';

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
  const difference = TARGET_DATE.getTime() - now;

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
  // cambiar a true para funcionamiento real del popup
  const [isPopupOpen, setIsPopupOpen] = useState(true);

  const isButtonDisabled = buttonStatus === 'loading' || buttonStatus === 'success';

  useEffect(() => {
    // const timeLeft = getTimeLeft();

    // if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
    //   navigate('/');
    // }

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
      .subscribe(email)
      .then(() => {
        console.log('Suscripción registrada');
      })
      .catch(() => {
        console.error('Error al suscribir');
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
    <main className='min-h-screen w-full bg-sage-50 text-teal-900'>
      {isPopupOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm'>
          <div className='w-full max-w-md rounded-xl border border-sage-100 bg-white p-6 shadow-2xl sm:p-8'>
            <div className='flex w-full flex-row items-center justify-start gap-2'>
              <img src={'./logos/LogoAndo.png'} alt='Logo Ando' className='h-22 sm:h-28 md:h-28 w-auto object-cover' />
              <img src={'./logos/desafio_capri.png'} alt='Logo Desafío Capri' className='h-20 sm:h-24 md:h-24 w-auto object-cover' />
            </div>

            <h2 className='mt-3 text-3xl font-bold text-teal-800'>
              <span className='text-sage-800 italic'>Ando</span> - <span className='text-earth-600 italic'>Desafío Capri</span> Te agradecemos por acompañarnos en esta aventura!
            </h2>

            <p className='mt-3 text-sm leading-6 text-sage-800'>
              Registrate con tu mail y recibi descuentos exclusivos en experiencias <span className='text-sage-900 italic'>Ando</span> y en la proxima edicion de  <span className='text-earth-600 italic'>Desafío Capri</span>
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
                className={`w-full rounded-2xl px-5 py-3 text-base font-semibold text-white shadow-md transition ${buttonClassName}`}>
                {buttonMessage}
              </button>
            </form>

            <p className='mt-4 text-xs leading-5 text-sage-800'>Sin spam. Solo novedades importantes sobre el lanzamiento del proyecto.</p>
          </div>
        </div>
      )}

      <section className='relative left-1/2 w-full -translate-x-1/2'>
        <div className='relative overflow-hidden rounded-none bg-white shadow-lg'>
          <div className='relative h-80 md:h-105'>
            <img
              src={'./images/hero_image.jpg'}
              alt='Paisaje de montaña y naturaleza outdoor'
              className='inset-0 h-full w-full object-cover object-[50%100%]'
            />

            <div className='absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent' />

            {/* <div className='absolute right-8 top-15'>
              <img src={'./logos/logo_ando.png'} alt='Logo Ando' className='h-20 w-auto object-contain drop-shadow-md' />
            </div>

            <div className='absolute left-5 top-12'>
              <img src={'./logos/desafio_capri_blanco.png'} alt='Logo Desafio Capri' className='h-28 w-auto object-contain' />
            </div> */}

            <div className='absolute bottom-12 left-5 right-5'>
              <h1 className='text-4xl font-semibold uppercase tracking-[0.06em] text-white drop-shadow-sm'>DESAFIO CAPRI</h1>
              <p className='mt-2 text-sm text-white/90'>Trail running en Esquel, Patagonia.</p>

              <div className='mt-3 flex flex-wrap items-center gap-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/90'>
                <div className='flex items-center gap-2'>
                  <Calendar className='h-4 w-4' strokeWidth={1.7} />
                  16 DE MAYO DE 2026
                </div>

                <div className='flex items-center gap-2'>
                  <svg
                    className='h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='1.7'
                    strokeLinecap='round'
                    strokeLinejoin='round'>
                    <circle cx='12' cy='12' r='9' />
                    <path d='M12 7v5l3 2' />
                  </svg>
                  11:00 HS
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='relative z-10 -mt-8 px-4 mb-4'>
          <div className='mx-auto min-h-26 max-w-150 rounded-xl bg-teal-700 px-3 py-3.5 text-white shadow-md'>
            <img
              src={'./logos/desafio_capri_blanco.png'}
              alt='Logo Desafio Capri'
              className='mx-auto mb-4 h-20 w-auto object-contain md:h-28'
            />

            <p className='text-center text-[11px] font-semibold uppercase tracking-[0.25em] text-sage-200'>
              ¿Estás preparado para este desafío?
            </p>

            <div className='mt-4 grid grid-cols-4 divide-x divide-white/15 text-center'>
              <div className='px-2'>
                <p className='text-[28px] font-bold leading-none'>{formatTime(timeLeft.days)}</p>
                <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>Días</p>
              </div>
              <div className='px-2'>
                <p className='text-[28px] font-bold leading-none'>{formatTime(timeLeft.hours)}</p>
                <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>Hs</p>
              </div>
              <div className='px-2'>
                <p className='text-[28px] font-bold leading-none'>{formatTime(timeLeft.minutes)}</p>
                <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>Min</p>
              </div>
              <div className='px-2'>
                <p className='text-[28px] font-bold leading-none'>{formatTime(timeLeft.seconds)}</p>
                <p className='mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70'>Seg</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className='overflow-hidden mx-auto flex min-h-screen w-full max-w-300 flex-col gap-4 px-4 pb-10 pt-0 sm:px-5'>
        <section className='rounded-xl bg-white px-4 py-5 shadow-sm'>
          <div className='flex items-start gap-3'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-teal-50 shadow-sm'>
              <div className='flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm'>
                <Calendar className='z-10 h-4.5 w-4.5' strokeWidth={2} />
              </div>
            </div>

            <div className='pt-0.5'>
              <h2 className='text-base font-bold text-teal-800'>Ando Info | Cronograma y Puntos Clave</h2>
              <p className='mt-1 text-xs leading-snug text-teal-700'>Todo lo que necesitás saber para moverte el día del evento:</p>
            </div>
          </div>

          <div className='relative mt-6'>
            <span className='absolute bottom-12.5 left-5.75 -top-15 z-0 border-l-[2.5px] border-dotted border-teal-600' />

            <div className='space-y-4'>
              <div className='relative flex items-stretch gap-0'>
                <div className='relative flex w-12 shrink-0 items-center justify-center'>
                  {/* Línea horizontal */}
                  <span className='absolute left-[40px] top-1/2 z-0 h-[2.5px] w-[50px] -translate-y-1/2 bg-teal-400' />
                  {/* Punto bullseye verde */}
                  <div className='relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-[2.5px] border-teal-600 bg-transparent'>
                    <div className='relative z-10 h-1.5 w-1.5 rounded-full bg-teal-600' />
                  </div>
                </div>
                
                {/* Espaciador */}
                <div className='relative z-0 flex items-center justify-center w-2 shrink-0' />
                
                <div className='relative flex-1 pl-4'>
                  <div className='absolute left-[-4px] top-1/2 z-10 -translate-y-1/2 flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#EAEFE9]'>
                    <div className='flex h-[36px] w-[36px] items-center justify-center rounded-full bg-teal-400 text-white shadow-sm'>
                      <Flag className='h-4 w-4' strokeWidth={2.2} />
                    </div>
                  </div>
                  
                  <div className='min-h-[64px] rounded-[12px] border border-teal-100 bg-teal-50 py-3 pl-[54px] pr-4'>
                    <p className='text-[13px] font-bold text-teal-800'>Acreditacion: 10:00 hs a 13:00hs y 14:30 a 21:00hs.En Alfa Fitness</p>
                    <p className='mt-0.5 text-[12px] text-teal-700'>Se realizara la entrega del kit de carrera a cada corredor con su respectivo numero</p>
                  </div>
                </div>
              </div>
              {/* Card 1 */}
              <div className='relative flex items-stretch gap-0'>
                <div className='relative flex w-12 shrink-0 items-center justify-center'>
                  <span className='absolute left-5 top-1/2 z-0 h-[2.5px] w-12.5 -translate-y-1/2 bg-teal-400' />
                  <div className='relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-[2.5px] border-teal-600 bg-white'>
                    <div className='relative z-10 h-1.5 w-1.5 rounded-full bg-teal-600' />
                  </div>
                </div>

                <div className='relative flex-1'>
                  <div className='flex items-center gap-4 min-h-16 rounded-xl border border-teal-100 bg-teal-50 p-2'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-full bg-teal-400 text-white shadow-sm shrink-0'>
                      <Flag className='h-4 w-4' strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className='text-[13px] font-bold text-teal-800'>Largada: 11:00 hs (Puntual) en El Tambo.</p>
                      <p className='mt-0.5 text-xs text-teal-700'>Procura llegar con anticipación suficiente para el control de chips.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='relative flex items-stretch gap-0'>
                <div className='relative flex w-12 shrink-0 items-center justify-center'>
                  <span className='absolute left-5 top-1/2 z-0 h-[2.5px] w-12.5 -translate-y-1/2 bg-teal-400' />
                  <div className='relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-[2.5px] border-teal-600 bg-white'>
                    <div className='relative z-10 h-1.5 w-1.5 rounded-full bg-teal-600' />
                  </div>
                </div>

                <div className='relative flex-1'>
                  <div className='flex items-center gap-4 min-h-16 rounded-xl border border-teal-100 bg-teal-50 p-2'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-full bg-teal-400 text-white shadow-sm shrink-0'>
                      <Trophy className='h-4 w-4' strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className='text-[13px] font-bold text-teal-800'>Llegada y Premiación: En 25 de Mayo y Rivadavia.</p>
                      <p className='mt-0.5 text-xs text-teal-700'>
                        Premiación estimada a las 15:00 hs. (sujeta a cambios informados por locución).
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className='relative flex items-stretch gap-0'>
                <div className='relative flex w-12 shrink-0 items-center justify-center'>
                  <span className='absolute left-5 top-1/2 z-0 h-[2.5px] w-12.5 -translate-y-1/2 bg-teal-400' />
                  <div className='relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-[2.5px] border-teal-600 bg-white'>
                    <div className='relative z-10 h-1.5 w-1.5 rounded-full bg-teal-600' />
                  </div>
                </div>

                <div className='relative flex-1'>
                  <div className='flex items-center gap-4 min-h-16 rounded-xl border border-teal-100 bg-teal-50 p-2'>
                    <div className='flex h-9 w-9 items-center justify-center rounded-full bg-teal-400 text-white shadow-sm shrink-0'>
                      <Music className='h-4 w-4' strokeWidth={2.2} />
                    </div>
                    <div>
                      <p className='text-[13px] font-bold text-teal-800'>Capri Fest: 22:00 hs en VER DISCO CLUB.</p>
                      <p className='mt-0.5 text-xs text-teal-700'>
                        Acceso libre y gratuito para corredores y acompañantes.
                        <br />
                        Menores hasta las 00:00 hs.
                        <br />
                        Corredores deben llevar la pulsera del kit para participar de los sorteos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className='rounded-xl bg-white p-4 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <MapPin className='h-4.5 w-4.5 text-earth-900' />
            <h2 className='text-[15px] font-bold text-earth-900'>Ubicación</h2>
          </div>

          <div className='flex flex-col overflow-hidden rounded-xl bg-earth-50 shadow-md'>
            <div className='flex flex-1 items-center justify-between gap-4 p-4 pl-5'>
              <div className='flex flex-col justify-center'>
                <p className='text-sm font-bold text-earth-900'>EL TAMBO</p>
                <p className='mt-0.5 text-[13px] text-earth-900'>Largada: 11:00 hs</p>
              </div>

              <a
                href='https://www.google.com/maps/search/?api=1&query=-42.87940096434897,-71.28898438152648'
                target='_blank'
                rel='noopener noreferrer'
                className='flex shrink-0 items-center gap-2 rounded-xl bg-earth-200 px-4 py-1.75 shadow-sm transition-colors'>
                <Navigation className='h-3.5 w-3.5 text-earth-900' />
                <span className='text-[11px] font-bold tracking-[0.02em] text-earth-900'>ABRIR EN MAPS</span>
              </a>
            </div>

            <div className='relative h-32.5 rounded-xl w-full shrink-0 overflow-hidden border-t border-[#E9F0E9] md:h-75 md:border-l md:border-t-0'>
              <iframe
                src='https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d517.5858036615381!2d-71.28898438152648!3d-42.87940096434897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1ses!ar!4v1778593929524!5m2!1ses!ar'
                className='absolute h-full w-[calc(100%+4px)]'
                style={{ border: 0 }}
                allowFullScreen={false}
                loading='lazy'
                referrerPolicy='no-referrer-when-downgrade'
              />
            </div>
          </div>
        </section>

        <section className='rounded-xl border border-[#E9F0E9] bg-white px-4 py-4 shadow-sm'>
          <div className='flex items-start gap-2.5'>
            <div>
              <div className='flex items-end gap-2.5'>
                <div className='flex items-center gap-2'>
                  <TriangleAlert className='h-4.5 w-4.5 text-sage-800' />
                  <h2 className='text-[15px] font-bold text-sage-800'>Guía del Corredor - Ando Tips</h2>
                </div>
              </div>
              <p className='mt-1 text-[13px] leading-5 text-sage-800'>
                La seguridad y el respeto por el entorno son nuestra prioridad. Seguí estas instrucciones para garantizar tu clasificación:
              </p>
            </div>
          </div>

          <div className='mt-4 flex flex-col gap-2.5'>
            <div className='flex items-center gap-3 rounded-xl border border-sage-200/80 bg-sage-400/80 p-3 shadow-sm md:gap-4 md:p-4'>
              <div className='relative flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-full border-2 border-sage-600/80 bg-sage-800/80'>
                <Calendar className='h-6 w-6 text-white' strokeWidth={1.8} />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-bold text-sage-900'>Ando Tip | Identidad y Clasificación</p>
                <p className='mt-0.5 text-xs leading-[1.35] text-sage-900'>
                  El dorsal debe estar siempre al frente y visible sobre cualquier prenda. No lo coloques en la espalda. Perder el dorsal o
                  no llevarlo correctamente implica la descalificación inmediata de la carrera.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 rounded-xl border border-sage-200/70 bg-sage-400/60 p-3 shadow-sm md:gap-4 md:p-4'>
              <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-full border-2 border-sage-600/70 bg-sage-800/70'>
                <Compass className='h-6.5 w-6.5 text-white' strokeWidth={1.8} />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-bold text-sage-900'>Ando Tip | Navegación y Seguridad</p>
                <p className='mt-0.5 text-xs leading-[1.35] text-sage-900'>
                  El circuito está marcado para que siempre puedas ver de una cinta a la otra. Si avanzás unos metros y no visualizás la
                  próxima cinta flúor, detenete y volvé a la anterior para retomar el camino correcto. No improvises senderos.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 rounded-xl border border-sage-200/60 bg-sage-400/40 p-3 shadow-sm md:gap-4 md:p-4'>
              <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-full border-2 border-sage-600/60 bg-sage-800/60'>
                <Leaf className='h-6.5 w-6.5 text-white' strokeWidth={1.8} />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-bold text-sage-900'>Ando Tip | Compromiso Ambiental</p>
                <p className='mt-0.5 text-xs leading-[1.35] text-sage-900'>
                  Huella cero. Está estrictamente prohibido arrojar envoltorios o geles en el recorrido. Usá los cestos en los Puestos de
                  Abastecimiento. Cuidar el cerro es responsabilidad de todos.
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3 rounded-xl border border-sage-200/50 bg-sage-400/20 p-3 shadow-sm md:gap-4 md:p-4'>
              <div className='flex h-13.5 w-13.5 shrink-0 items-center justify-center rounded-full border-2 border-sage-600/50 bg-sage-800/50'>
                <Droplet className='h-6.5 w-6.5 text-white' strokeWidth={1.8} />
              </div>
              <div className='flex-1'>
                <p className='text-sm font-bold text-sage-900'>Ando Tip | Hidratación Responsable</p>
                <p className='mt-0.5 text-xs leading-[1.35] text-sage-900'>
                  Sé autosuficiente. No habrá vasos descartables en los puestos. Asegurate de llevar tu propio recipiente (soft flask,
                  mochila o botellita) para recargar.
                </p>
              </div>
            </div>

          </div>
        </section>
        

        <section className='relative overflow-hidden rounded-xl border border-teal-100/60 bg-teal-50 px-4 py-4 shadow-sm'>
          <img src={'./logos/logo_ando.png'} alt='' className='pointer-events-none absolute -bottom-1 -right-2 h-50 opacity-16' />
          <h2 className='text-[17px] font-semibold text-teal-800/90'>Explorá con confianza. Explorá con Ando.</h2>
          <p className='mt-3 text-[13px] leading-6 text-teal-700'>
            Ando es mucho más que una plataforma: es nuestra insignia de seguridad, compromiso ambiental y calidad en cada aventura. Nacimos
            en Esquel para ser el puente entre quienes buscan descubrir la inmensidad de la Patagonia y los prestadores locales que mejor
            conocen sus secretos.
          </p>
          <p className='mt-3 text-[13px] leading-6 text-teal-800/90'>
            Creemos en un turismo que cuida lo que amamos. Por eso, cada experiencia conectada por Ando garantiza estándares de seguridad
            profesional y un respeto absoluto por nuestro entorno natural.
          </p>
          <p className='mt-3 text-[13px] leading-6 text-teal-800/90'>
            Hoy te acompañamos en el Desafío Capri. Mañana, te acompañamos a descubrir tu próxima meta.
          </p>
        </section>
      </section>
    </main>
  );
}
