import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Users, ArrowLeft, ShieldCheck } from 'lucide-react';
import { activityService } from '../../services/activity.service';
import type { Activity } from '../../types/types';

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const DIFFICULTY_LABELS: Record<string, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  EXTREMA: 'Extrema',
};

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours} hs`;
  return `${hours} hs ${remainder} min`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR');
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      setLoading(false);
      return;
    }

    activityService
      .getActivityById(Number(id))
      .then((data) => {
        setActivity(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-teal-200 border-t-teal-700' />
      </div>
    );
  }

  if (error || !activity) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-sage-50'>
        <p className='font-sans text-body-large font-bold text-teal-900'>No pudimos cargar la actividad.</p>
        <Link to='/' className='font-sans text-body font-bold text-teal-700 underline'>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const heroImage = activity.images?.[0];
  const hasDaysOfWeek = activity.days_of_week && activity.days_of_week.length > 0;
  const hasAdditionalInfo = hasDaysOfWeek || activity.min_age !== null;

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <main className='mx-auto max-w-7xl px-6 py-8'>
        <Link to='/' className='mb-6 flex items-center gap-2 font-sans text-body font-bold text-sage-600 transition hover:text-teal-800'>
          <ArrowLeft size={18} />
          Explorar actividades
        </Link>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]'>
          {/* Columna principal */}
          <div className='space-y-6'>
            {/* Hero */}
            <div className='relative h-[280px] overflow-hidden rounded-2xl lg:h-[420px]'>
              {heroImage ? (
                <img src={heroImage} alt={activity.title} className='h-full w-full object-cover' />
              ) : (
                <div className='h-full w-full bg-gradient-to-b from-teal-800 to-teal-600' />
              )}

              <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent' />

              <div className='absolute left-4 top-4 flex items-center gap-2'>
                {activity.category && (
                  <span className='rounded-xl bg-teal-700/80 px-4 py-2 font-sans text-sm font-bold text-white backdrop-blur'>
                    {activity.category.name}
                  </span>
                )}
                {activity.difficulty && (
                  <span className='rounded-xl bg-earth-600/80 px-4 py-2 font-sans text-sm font-bold text-white backdrop-blur'>
                    {DIFFICULTY_LABELS[activity.difficulty] ?? activity.difficulty}
                  </span>
                )}
              </div>

              <div className='absolute bottom-6 left-6 right-6'>
                <h1 className='font-display text-3xl uppercase leading-tight tracking-[0.04em] text-white lg:text-5xl'>
                  {activity.title}
                </h1>
                {activity.location && (
                  <p className='mt-2 font-sans text-sm text-white/80'>{activity.location}</p>
                )}
              </div>
            </div>

            {/* Stats bar */}
            <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
              <div className='flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm'>
                <MapPin size={20} className='text-sage-600' />
                <span className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Ubicación</span>
                <span className='text-center font-sans text-sm font-bold text-teal-900'>{activity.location ?? '—'}</span>
              </div>

              <div className='flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm'>
                <Clock size={20} className='text-sage-600' />
                <span className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Duración</span>
                <span className='font-sans text-sm font-bold text-teal-900'>
                  {activity.duration_minutes != null ? formatDuration(activity.duration_minutes) : '—'}
                </span>
              </div>

              <div className='flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm'>
                <Users size={20} className='text-sage-600' />
                <span className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Grupo máx.</span>
                <span className='font-sans text-sm font-bold text-teal-900'>
                  {activity.max_participants != null ? `${activity.max_participants} personas` : '—'}
                </span>
              </div>

              <div className='flex flex-col items-center gap-2 rounded-2xl bg-white p-5 shadow-sm'>
                <Clock size={20} className='text-sage-600' />
                <span className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Horario</span>
                <span className='font-sans text-sm font-bold text-teal-900'>{activity.starting_hour ?? '—'}</span>
              </div>
            </div>

            {/* Descripción */}
            {activity.description && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='mb-4 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>
                  Sobre esta experiencia
                </h2>
                <p className='font-sans text-body leading-relaxed text-sage-800'>{activity.description}</p>
              </div>
            )}

            {/* Info adicional */}
            {hasAdditionalInfo && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='mb-4 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>
                  Información adicional
                </h2>
                <div className='space-y-4'>
                  {hasDaysOfWeek && (
                    <div>
                      <p className='mb-2 font-sans text-sm font-bold text-sage-600'>Días disponibles</p>
                      <div className='flex flex-wrap gap-2'>
                        {activity.days_of_week.map((day) => (
                          <span key={day} className='rounded-full bg-teal-50 px-3 py-1 font-sans text-sm font-bold text-teal-800'>
                            {DAY_NAMES[day]}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activity.min_age !== null && (
                    <p className='font-sans text-sm text-sage-800'>
                      <span className='font-bold text-teal-900'>Edad mínima:</span> {activity.min_age} años
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Botón reserva mobile */}
            <div className='lg:hidden'>
              <Link
                to={`/booking/${activity.id}`}
                className='block w-full rounded-2xl bg-teal-800 px-6 py-4 text-center font-sans text-body font-bold text-white shadow-md transition hover:bg-teal-900'>
                Reservar esta experiencia
              </Link>
              <p className='mt-2 flex items-center justify-center gap-2 font-sans text-xs text-sage-600'>
                <ShieldCheck size={14} />
                Pago seguro · Cancelación flexible
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className='hidden lg:block'>
            <div className='sticky top-8 rounded-2xl bg-teal-900 p-6 text-white shadow-xl'>
              <div className='mb-4'>
                <span className='font-display text-4xl font-bold tracking-wide'>
                  ${formatPrice(activity.base_price)}
                </span>
                <span className='ml-2 font-sans text-sm text-teal-200'>{activity.currency} / persona</span>
              </div>

              <Link
                to={`/booking/${activity.id}`}
                className='block w-full rounded-2xl bg-white px-6 py-4 text-center font-sans text-body font-bold text-teal-900 shadow-md transition hover:bg-teal-50'>
                Reservar esta experiencia
              </Link>

              <p className='mt-3 flex items-center justify-center gap-2 font-sans text-xs text-teal-300'>
                <ShieldCheck size={14} />
                Pago seguro · Cancelación flexible
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
