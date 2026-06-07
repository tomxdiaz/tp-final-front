import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  XCircle,
  AlertTriangle,
  Tag,
  DollarSign,
  StickyNote,
  Navigation,
  Building2,
  Mail,
  Phone,
  BadgeCheck,
} from 'lucide-react';
import { bookingService } from '../../services/booking.service';
import { useAuth } from '../../auth/useAuth';
import type { Booking, BookingStatus } from '../../types/types';

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

const STATUS_DOT: Record<BookingStatus, string> = {
  PENDING: 'bg-amber-400',
  CONFIRMED: 'bg-emerald-500',
  CANCELLED: 'bg-red-400',
};

const STATUS_TEXT: Record<BookingStatus, string> = {
  PENDING: 'text-amber-600',
  CONFIRMED: 'text-emerald-600',
  CANCELLED: 'text-red-500',
};

const DIFFICULTY_LABEL: Record<string, string> = {
  BAJA: 'Baja',
  MEDIA: 'Media',
  ALTA: 'Alta',
  EXTREMA: 'Extrema',
};

function currency(n: number, curr = 'ARS') {
  return `${curr} $${n.toLocaleString('es-AR')}`;
}

function longDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateStr));
}

function shortTime(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
}

const BookingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { appUser } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        const b = await bookingService.getBookingById(Number(id));
        if (b.app_user.id !== appUser?.id) {
          setForbidden(true);
          return;
        }
        setBooking(b);
      } catch {
        setForbidden(true);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, appUser]);

  const handleCancel = async () => {
    if (!booking) return;
    setCancelling(true);
    try {
      const updated = await bookingService.cancelBooking(booking.id);
      setBooking(updated);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  if (forbidden || !booking) {
    return (
      <div className='min-h-screen bg-sage-50 flex flex-col items-center justify-center gap-4 px-6'>
        <AlertTriangle size={48} className='text-amber-400' />
        <p className='text-gray-600 text-center'>No tenés acceso a esta reserva.</p>
        <button
          onClick={() => navigate('/my-bookings')}
          className='flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-700 text-white text-sm font-bold hover:bg-teal-800 transition'>
          <ArrowLeft size={15} />
          Volver a mis reservas
        </button>
      </div>
    );
  }

  const session = booking.activity_session;
  const activity = session?.activity ?? null;
  const business = activity?.business ?? null;
  const isCancellable = booking.status !== 'CANCELLED';

  return (
    <div className='min-h-screen bg-sage-50'>
      {/* Header */}
      <div className='bg-teal-800'>
        <div className='mx-auto max-w-3xl px-6 pt-8 pb-6'>
          <button
            onClick={() => navigate('/my-bookings')}
            className='flex items-center gap-1.5 text-teal-300 hover:text-white text-xs font-sans font-semibold mb-4 transition'>
            <ArrowLeft size={14} />
            Volver a mis reservas
          </button>
          <p className='text-xs font-sans font-bold text-teal-300 uppercase tracking-widest mb-1'>Reserva #{booking.id}</p>
          <h1 className='font-display text-4xl text-white leading-none'>
            {activity ? activity.title : 'Actividad eliminada'}
          </h1>
          <div className='mt-3 flex items-center gap-2'>
            <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${STATUS_TEXT[booking.status]}`}>
              <span className={`w-2 h-2 rounded-full ${STATUS_DOT[booking.status]}`} />
              {STATUS_LABEL[booking.status]}
            </span>
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-3xl px-6 py-8 space-y-5'>
        {/* Booking details */}
        <section className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6'>
          <h2 className='text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-4'>Detalle de la reserva</h2>
          <dl className='grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3'>
            <div>
              <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                <Users size={12} />
                Personas
              </dt>
              <dd className='font-sans font-semibold text-gray-800'>
                {booking.number_of_people} {booking.number_of_people === 1 ? 'persona' : 'personas'}
              </dd>
            </div>
            <div>
              <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                <DollarSign size={12} />
                Total
              </dt>
              <dd className='font-display text-xl text-gray-800'>{currency(booking.total_price)}</dd>
            </div>
            <div>
              <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                <CalendarDays size={12} />
                Reservado el
              </dt>
              <dd className='font-sans text-sm text-gray-700'>
                {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(
                  new Date(booking.created_at),
                )}
              </dd>
            </div>
            {booking.customer_notes && (
              <div className='col-span-2 sm:col-span-3'>
                <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                  <StickyNote size={12} />
                  Notas
                </dt>
                <dd className='text-sm text-gray-600 italic'>"{booking.customer_notes}"</dd>
              </div>
            )}
          </dl>
        </section>

        {/* Session details */}
        {session ? (
          <section className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6'>
            <h2 className='text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-4'>Sesión</h2>
            <dl className='grid grid-cols-2 gap-x-8 gap-y-4'>
              <div>
                <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                  <CalendarDays size={12} />
                  Fecha
                </dt>
                <dd className='font-sans font-semibold text-gray-800 capitalize'>{longDate(session.datetime)}</dd>
              </div>
              <div>
                <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                  <Clock size={12} />
                  Hora
                </dt>
                <dd className='font-sans font-semibold text-gray-800'>{shortTime(session.datetime)}</dd>
              </div>
            </dl>
          </section>
        ) : (
          <div className='bg-amber-50 border border-amber-100 rounded-2xl p-5 flex items-center gap-3 text-amber-700 text-sm'>
            <AlertTriangle size={16} className='shrink-0' />
            La sesión asociada a esta reserva ya no está disponible.
          </div>
        )}

        {/* Activity details */}
        {activity && (
          <section className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6'>
            <h2 className='text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-4'>Actividad</h2>

            {activity.description && (
              <p className='text-sm text-gray-600 leading-relaxed mb-4'>{activity.description}</p>
            )}

            <dl className='grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3'>
              {activity.location && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <MapPin size={12} />
                    Ubicación
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>{activity.location}</dd>
                </div>
              )}

              {activity.meeting_point && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <Navigation size={12} />
                    Punto de encuentro
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>{activity.meeting_point}</dd>
                </div>
              )}

              {activity.latitude != null && activity.longitude != null && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <MapPin size={12} />
                    Coordenadas
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>
                    <a
                      href={`https://maps.google.com/?q=${activity.latitude},${activity.longitude}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='text-teal-600 hover:underline'>
                      {activity.latitude.toFixed(5)}, {activity.longitude.toFixed(5)}
                    </a>
                  </dd>
                </div>
              )}

              {activity.difficulty && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <Tag size={12} />
                    Dificultad
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>{DIFFICULTY_LABEL[activity.difficulty]}</dd>
                </div>
              )}

              {activity.duration_minutes != null && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <Clock size={12} />
                    Duración
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>{activity.duration_minutes} min</dd>
                </div>
              )}

              {activity.max_participants != null && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <Users size={12} />
                    Máx. participantes
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>{activity.max_participants}</dd>
                </div>
              )}

              <div>
                <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                  <DollarSign size={12} />
                  Precio base
                </dt>
                <dd className='text-sm font-semibold text-gray-700'>{currency(activity.base_price, activity.currency)}</dd>
              </div>
            </dl>
          </section>
        )}

        {/* Business details */}
        {business && (
          <section className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-6'>
            <h2 className='text-xs font-sans font-bold text-gray-400 uppercase tracking-widest mb-4'>Empresa</h2>
            <div className='flex items-start gap-3 mb-4'>
              <Building2 size={18} className='text-teal-600 shrink-0 mt-0.5' />
              <div>
                <p className='font-sans font-bold text-gray-800 text-base flex items-center gap-2'>
                  {business.business_name}
                  {business.verified && (
                    <span className='inline-flex items-center gap-1 text-xs font-semibold text-teal-600'>
                      <BadgeCheck size={13} />
                      Verificada
                    </span>
                  )}
                </p>
                {business.description && (
                  <p className='text-sm text-gray-500 mt-1 leading-relaxed'>{business.description}</p>
                )}
              </div>
            </div>

            <dl className='grid grid-cols-1 gap-y-3 sm:grid-cols-2'>
              {business.contact_email && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <Mail size={12} />
                    Email de contacto
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>
                    <a href={`mailto:${business.contact_email}`} className='text-teal-600 hover:underline'>
                      {business.contact_email}
                    </a>
                  </dd>
                </div>
              )}
              {business.contact_phone && (
                <div>
                  <dt className='flex items-center gap-1.5 text-xs text-gray-400 mb-0.5'>
                    <Phone size={12} />
                    Teléfono de contacto
                  </dt>
                  <dd className='text-sm font-semibold text-gray-700'>
                    <a href={`tel:${business.contact_phone}`} className='text-teal-600 hover:underline'>
                      {business.contact_phone}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        {/* Actions */}
        <div className='flex items-center justify-between pt-2'>
          <button
            onClick={() => navigate('/my-bookings')}
            className='flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-50 transition'>
            <ArrowLeft size={15} />
            Volver
          </button>

          {isCancellable &&
            (confirmCancel ? (
              <div className='flex items-center gap-2'>
                <span className='text-xs text-gray-500'>¿Confirmar cancelación?</span>
                <button
                  onClick={handleCancel}
                  disabled={cancelling}
                  className='px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition disabled:opacity-50'>
                  {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
                </button>
                <button
                  onClick={() => setConfirmCancel(false)}
                  className='px-4 py-2.5 rounded-xl bg-gray-100 text-gray-600 text-sm font-bold hover:bg-gray-200 transition'>
                  No
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmCancel(true)}
                className='flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-500 border border-red-200 hover:bg-red-50 transition'>
                <XCircle size={15} />
                Cancelar reserva
              </button>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
