import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, Timer, Users, ArrowLeft, Phone, Mail, Building2, CalendarDays, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { activityService } from '../../services/activity.service';
import type { Activity } from '../../types/types';
import { useAuth } from '../../auth/useAuth';

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

function formatSessionDatetime(datetime: string): { date: string; time: string } {
  const d = new Date(datetime);
  const date = d.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  return { date, time };
}

export default function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const { appUser } = useAuth();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(!id);
  const [renewing, setRenewing] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!id) return;

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

  const handleRenew = async () => {
    if (!activity) return;
    setRenewing(true);
    try {
      const updated = await activityService.renewActivitySessions(activity.id);
      setActivity(updated);
    } finally {
      setRenewing(false);
    }
  };

  const images = activity.images;
  const hasDaysOfWeek = activity.days_of_week.length > 0;
  const hasAdditionalInfo = hasDaysOfWeek || activity.min_age !== null;
  const isOwner = appUser != null && activity.business != null && appUser.id === activity.business.app_user_id;

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <div className='mx-auto max-w-7xl px-6 py-8'>
        <Link to='/' className='mb-6 flex items-center gap-2 font-sans text-body font-bold text-sage-600 transition hover:text-teal-800'>
          <ArrowLeft size={18} />
          Explorar actividades
        </Link>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]'>
          {/* Columna principal */}
          <div className='space-y-6'>
            {/* Hero / carousel */}
            <div className='relative h-[280px] overflow-hidden rounded-2xl lg:h-[420px]'>
              {images.length > 0 ? (
                <img src={images[activeImage]} alt={`${activity.title} — imagen ${activeImage + 1}`} className='h-full w-full object-cover' />
              ) : (
                <div className='h-full w-full bg-linear-to-b from-teal-800 to-teal-600' />
              )}

              <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />

              {/* Prev / next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type='button'
                    onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                    className='absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition-colors'>
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                    className='absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/60 transition-colors'>
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

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
                <h1 className='font-display text-3xl uppercase leading-tight tracking-[0.04em] text-white lg:text-5xl'>{activity.title}</h1>
                {activity.location && <p className='mt-2 font-sans text-sm text-white/80'>{activity.location}</p>}

                {/* Dots */}
                {images.length > 1 && (
                  <div className='mt-3 flex items-center gap-1.5'>
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type='button'
                        onClick={() => setActiveImage(i)}
                        className={`h-1.5 rounded-full transition-all ${i === activeImage ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'}`}
                      />
                    ))}
                  </div>
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
                <Timer size={20} className='text-sage-600' />
                <span className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Horario</span>
                <span className='font-sans text-sm font-bold text-teal-900'>{activity.starting_hour?.slice(0, 5) ?? '—'}</span>
              </div>
            </div>

            {/* Descripción */}
            {activity.description && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='mb-4 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>Sobre esta experiencia</h2>
                <p className='font-sans text-body leading-relaxed text-sage-800'>{activity.description}</p>
              </div>
            )}

            {/* Info adicional */}
            {hasAdditionalInfo && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='mb-4 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>Información adicional</h2>
                <div className='space-y-4'>
                  {hasDaysOfWeek && (
                    <div>
                      <p className='mb-2 font-sans text-sm font-bold text-sage-600'>Días disponibles</p>
                      <div className='flex flex-wrap gap-2'>
                        {activity.days_of_week.map((day) => (
                          <span key={day} className='rounded-full bg-teal-50 px-3 py-1 font-sans text-sm font-bold text-teal-800'>
                            {DAY_NAMES[day] ?? String(day)}
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

            {/* Business info */}
            {activity.business && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <h2 className='mb-4 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>Organizador</h2>
                <div className='space-y-3'>
                  <div className='flex items-center gap-3'>
                    <Building2 size={18} className='shrink-0 text-sage-600' />
                    <span className='font-sans text-body font-bold text-teal-900'>{activity.business.business_name}</span>
                    {activity.business.verified && (
                      <span className='rounded-full bg-teal-50 px-2 py-0.5 font-sans text-xs font-bold text-teal-700'>Verificado</span>
                    )}
                  </div>
                  {activity.business.description && (
                    <p className='font-sans text-sm leading-relaxed text-sage-800'>{activity.business.description}</p>
                  )}
                  {activity.business.contact_phone && (
                    <div className='flex items-center gap-3'>
                      <Phone size={16} className='shrink-0 text-sage-600' />
                      <span className='font-sans text-sm text-teal-900'>{activity.business.contact_phone}</span>
                    </div>
                  )}
                  {activity.business.contact_email && (
                    <div className='flex items-center gap-3'>
                      <Mail size={16} className='shrink-0 text-sage-600' />
                      <span className='font-sans text-sm text-teal-900'>{activity.business.contact_email}</span>
                    </div>
                  )}
                  <Link
                    to={`/business/${activity.business.id}`}
                    className='mt-1 inline-block rounded-xl border border-teal-700 px-4 py-2 font-sans text-sm font-bold text-teal-700 transition hover:bg-teal-50'>
                    Ver perfil del organizador
                  </Link>
                </div>
              </div>
            )}

            {/* Owner-only: sessions */}
            {isOwner && activity.sessions && activity.sessions.length > 0 && (
              <div className='rounded-2xl bg-white p-6 shadow-sm'>
                <div className='mb-4 flex items-center justify-between'>
                  <h2 className='font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>Sesiones programadas</h2>
                  <button
                    onClick={handleRenew}
                    disabled={renewing}
                    className='flex items-center gap-2 rounded-xl bg-teal-700 px-4 py-2 font-sans text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60'
                    title='Renovar sesiones'>
                    <RefreshCw size={15} className={renewing ? 'animate-spin' : ''} />
                    {renewing ? 'Renovando...' : 'Renovar sesiones'}
                  </button>
                </div>
                <div className='space-y-3'>
                  {activity.sessions.map((session) => {
                    const { date, time } = formatSessionDatetime(session.datetime);
                    const availableSpots =
                      activity.max_participants != null ? activity.max_participants - session.booked_spots : null;
                    return (
                      <Link
                        key={session.id}
                        to={`/activity/${activity.id}/session/${session.id}`}
                        className='flex items-center justify-between rounded-xl border border-sage-100 bg-sage-50 px-4 py-3 transition hover:border-teal-200 hover:bg-teal-50'>
                        <div className='flex items-center gap-3'>
                          <CalendarDays size={18} className='shrink-0 text-teal-700' />
                          <div>
                            <p className='font-sans text-sm font-bold capitalize text-teal-900'>{date}</p>
                            <p className='font-sans text-xs text-sage-600'>{time} hs</p>
                          </div>
                        </div>
                        <div className='text-right'>
                          <p className='font-sans text-sm font-bold text-teal-900'>
                            {availableSpots != null
                              ? availableSpots > 0
                                ? `${availableSpots} lugar${availableSpots !== 1 ? 'es' : ''} disponible${availableSpots !== 1 ? 's' : ''}`
                                : 'Sin cupos disponibles'
                              : `${session.booked_spots} reservados`}
                          </p>
                          <p
                            className={`font-sans text-xs font-bold ${
                              session.status === 'CANCELLED'
                                ? 'text-red-500'
                                : session.status === 'COMPLETED' || availableSpots === 0
                                  ? 'text-sage-500'
                                  : 'text-teal-600'
                            }`}>
                            {session.status === 'CANCELLED'
                              ? 'Cancelada'
                              : session.status === 'COMPLETED'
                                ? 'Completada'
                                : availableSpots === 0
                                  ? 'Agotada'
                                  : 'Disponible'}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
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
            </div>
          </div>

          {/* Sidebar */}
          <aside className='hidden lg:block'>
            <div className='sticky top-8 rounded-2xl bg-teal-900 p-6 text-white shadow-xl'>
              <div className='mb-4'>
                <span className='font-display text-4xl font-bold tracking-wide'>${formatPrice(activity.base_price)}</span>
                <span className='ml-2 font-sans text-sm text-teal-200'>{activity.currency} / persona</span>
              </div>

              <Link
                to={`/booking/${activity.id}`}
                className='block w-full rounded-2xl bg-white px-6 py-4 text-center font-sans text-body font-bold text-teal-900 shadow-md transition hover:bg-teal-50'>
                Reservar esta experiencia
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
