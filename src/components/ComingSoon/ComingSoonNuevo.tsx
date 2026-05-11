import { useEffect, useState } from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { healthService } from '../../services/health.service';

const TARGET_DATE = new Date('2026-05-16T10:00:00');

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

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

  useEffect(() => {
    healthService.health().catch((error) => {
      console.error('Error de salud del backend:', error);
    });

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

  return (
    <main className='min-h-screen w-full bg-earth-50 text-teal-900'>
      <section className='mx-auto flex min-h-screen max-w-500 flex-col'>
        <div className='relative h-70 overflow-hidden shadow-xl sm:h-90 lg:h-107.5'>
          <img src={'./images/banner.jpeg'} alt='Paisaje de montaña y naturaleza outdoor' className='h-full w-full object-cover' />

          <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent' />

          <div className='absolute bottom-0 left-0 right-0 p-6 sm:p-10'>
            <div className='flex flex-row items-center gap-4'>
              {/* <h1 className='max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl'>ANDO</h1> */}
              <img src={'./logos/ando.png'} alt='Logo Ando' className='h-18 sm:h-20 md:h-28 w-auto object-cover' />
            </div>

            <p className='mt-3 max-w-2xl text-base leading-7 text-white/90 sm:text-lg'>
              La forma simple de descubrir, comparar y reservar experiencias outdoor en Esquel.
            </p>
          </div>
        </div>

        <div className='flex flex-1 flex-col gap-6 p-6 py-6 lg:py-16'>
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

          <div className='rounded-3xl border border-teal-100 bg-white p-6 shadow-xl sm:p-8'>
            <div className='flex items-start gap-3'>
              <div>
                <p className='text-sm font-semibold uppercase tracking-[0.2em] text-teal-600'>Ando Info</p>
                <h3 className='mt-2 text-2xl font-bold text-teal-900'>Cronograma y Puntos Clave</h3>
                <p className='mt-2 text-sm leading-6 text-sage-800'>Todo lo que necesitás saber para moverte el día del evento:</p>
              </div>
            </div>

            <div className='mt-6 space-y-6 text-sm leading-6 text-sage-800'>
              <div className='rounded-2xl border border-sage-100 bg-sage-50/70 p-4'>
                <div className='flex items-center gap-2 text-teal-900'>
                  <MapPin className='h-4 w-4' />
                  <p className='text-sm font-semibold'>Ando Info | Cronograma y Puntos Clave</p>
                </div>
                <ul className='mt-3 space-y-3'>
                  <li>
                    <p className='font-semibold text-teal-900'>Largada: 11:00 hs (Puntual) en El Tambo.</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      Nota: Se debe asistir con antelacion para le control de chips y un buen calentamiento.
                    </p>
                  </li>
                  <li>
                    <p className='font-semibold text-teal-900'>Llegada y Premiación: En 25 de Mayo y Rivadavia.</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      Horario: Premiación estimada a las 15:00 hs (sujeta a cambios informados por los locutores del evento).
                    </p>
                  </li>
                  <li>
                    <p className='font-semibold text-teal-900'>Capri Fest: 22:00 hs en VER DISCO CLUB.</p>
                    <p className='mt-1 text-sm text-sage-700'>Acceso: Libre y gratuito para corredores y acompañantes.</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      Importante: Menores hasta las 00:00 hs. Corredores deben llevar la pulsera del kit para participar de los sorteos.
                    </p>
                  </li>
                </ul>
              </div>
              <div className='mt-6 w-full'>
                <iframe
                  title='Mapa de la largada'
                  src='https://www.google.com/maps?q=-42.87918,-71.28880&z=16&output=embed'
                  className='h-100 w-full border-0'
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                />
              </div>

              <div className='rounded-2xl border border-sage-100 bg-white p-4'>
                <div className='flex items-center gap-2 text-teal-900'>
                  <AlertTriangle className='h-4 w-4' />
                  <p className='text-sm font-semibold'>Guía del Corredor: Ando Tips</p>
                </div>
                <p className='mt-3 text-sm text-sage-700'>
                  La seguridad y el respeto por el entorno son nuestra prioridad. Seguí estas instrucciones para garantizar tu
                  clasificación:
                </p>
                <ul className='mt-3 space-y-3'>
                  <li>
                    <p className='font-semibold text-teal-900'>Ando Tip | Identidad y Clasificación</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      El dorsal debe estar siempre al frente y visible sobre cualquier prenda. No lo coloques en la espalda. Tené en cuenta
                      que perder el dorsal o no llevarlo correctamente implica la descalificación inmediata de la carrera.
                    </p>
                  </li>
                  <li>
                    <p className='font-semibold text-teal-900'>Ando Tip | Navegación y Seguridad</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      El circuito está marcado para que siempre puedas ver de una cinta a la otra. Si avanzás unos metros y no visualizás la
                      próxima cinta flúor, detenete y volvé a la anterior para retomar el camino correcto. No improvises senderos.
                    </p>
                  </li>
                  <li>
                    <p className='font-semibold text-teal-900'>Ando Tip | Compromiso Ambiental</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      Huella cero. Está estrictamente prohibido arrojar envoltorios o geles en el recorrido. Usá los cestos en los Puestos
                      de Abastecimiento. Cuidar el cerro es responsabilidad de todos.
                    </p>
                  </li>
                  <li>
                    <p className='font-semibold text-teal-900'>Ando Tip | Hidratación Responsable</p>
                    <p className='mt-1 text-sm text-sage-700'>
                      Sé autosuficiente. No habrá vasos descartables en los puestos. Asegurate de llevar tu propio recipiente (soft flask,
                      mochila o botellita) para recargar.
                    </p>
                  </li>
                </ul>
              </div>

              <div className='rounded-2xl border border-sage-100 bg-white p-4'>
                <p className='text-sm font-semibold text-teal-900'>Explorá con confianza. Explorá con Ando.</p>
                <p className='mt-3 text-sm text-sage-700'>
                  Ando es mucho más que una plataforma: es nuestra insignia de seguridad, compromiso ambiental y calidad en cada aventura.
                  Nacimos en Esquel para ser el puente entre quienes buscan descubrir la inmensidad de la Patagonia y los prestadores
                  locales que mejor conocen sus secretos.
                </p>
                <p className='mt-3 text-sm text-sage-700'>
                  Creemos en un turismo que cuida lo que amamos. Por eso, cada experiencia conectada por Ando garantiza estándares de
                  seguridad profesional y un respeto absoluto por nuestro entorno natural.
                </p>
                <p className='mt-3 text-sm text-sage-700'>
                  Hoy te acompañamos en el Desafío Capri. Mañana, te acompañamos a descubrir tu próxima meta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
