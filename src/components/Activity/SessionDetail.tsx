import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Mountain,
  Users,
  XCircle,
} from 'lucide-react';
import { activityService } from '../../services/activity.service';
import { bookingService } from '../../services/booking.service';
import type { SessionDetail as SessionDetailType, SessionDetailBooking } from '../../types/types';

function formatDatetime(iso: string) {
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
  const time = new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return { date, time };
}

function formatPrice(n: number) {
  return n.toLocaleString('es-AR');
}

const BOOKING_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

const BOOKING_STATUS_CLASSES: Record<string, string> = {
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
};

const SESSION_STATUS_LABEL: Record<string, string> = {
  AVAILABLE: 'Disponible',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
};

const SESSION_STATUS_CLASSES: Record<string, string> = {
  AVAILABLE: 'bg-teal-50 text-teal-700 border-teal-200',
  CANCELLED: 'bg-red-50 text-red-600 border-red-200',
  COMPLETED: 'bg-sage-50 text-sage-600 border-sage-200',
};

function BookingCard({
  booking,
  onConfirm,
}: {
  booking: SessionDetailBooking;
  onConfirm?: (id: number) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);

  const user = booking.app_user;
  const displayName =
    [user.first_name, user.last_name].filter(Boolean).join(' ').trim() || user.email;

  async function handleConfirm() {
    setLoading(true);
    await onConfirm!(booking.id);
    setLoading(false);
    setConfirming(false);
  }

  return (
    <div className='rounded-2xl border border-gray-100 bg-white p-5 shadow-sm'>
      <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
        <div className='flex items-center gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50'>
            <Users size={18} className='text-teal-700' />
          </div>
          <div>
            <p className='font-sans text-sm font-bold text-gray-800'>{displayName}</p>
            {displayName !== user.email && (
              <p className='font-sans text-xs text-gray-400'>{user.email}</p>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2 self-start'>
          {booking.status === 'PENDING' && onConfirm && (
            confirming ? (
              <>
                <span className='font-sans text-xs font-semibold text-emerald-600'>¿Confirmar pago?</span>
                <button
                  onClick={handleConfirm}
                  disabled={loading}
                  className='rounded-lg bg-emerald-500 px-2.5 py-1 font-sans text-xs font-bold text-white hover:bg-emerald-600 transition disabled:opacity-60'>
                  {loading ? '...' : 'Sí'}
                </button>
                <button
                  onClick={() => setConfirming(false)}
                  disabled={loading}
                  className='rounded-lg border border-gray-300 px-2.5 py-1 font-sans text-xs font-bold text-gray-600 hover:bg-gray-50 transition disabled:opacity-60'>
                  No
                </button>
              </>
            ) : (
              <button
                onClick={() => setConfirming(true)}
                className='flex items-center gap-1.5 rounded-lg border border-emerald-200 px-3 py-1.5 font-sans text-xs font-bold text-emerald-600 hover:bg-emerald-50 transition'>
                <CheckCircle size={13} />
                Confirmar pago
              </button>
            )
          )}
          <span
            className={`rounded-full border px-3 py-0.5 font-sans text-xs font-bold ${BOOKING_STATUS_CLASSES[booking.status] ?? ''}`}>
            {BOOKING_STATUS_LABEL[booking.status] ?? booking.status}
          </span>
        </div>
      </div>

      <div className='mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3'>
        <div>
          <p className='font-sans text-xs text-gray-400'>Personas</p>
          <p className='font-sans text-sm font-bold text-gray-800'>{booking.number_of_people}</p>
        </div>
        <div>
          <p className='font-sans text-xs text-gray-400'>Total</p>
          <p className='font-sans text-sm font-bold text-gray-800'>${formatPrice(booking.total_price)}</p>
        </div>
        <div>
          <p className='font-sans text-xs text-gray-400'>Reserva #</p>
          <p className='font-sans text-sm font-bold text-gray-800'>{booking.id}</p>
        </div>
      </div>

      {booking.customer_notes && (
        <div className='mt-3 rounded-xl bg-sage-50 px-4 py-2'>
          <p className='font-sans text-xs text-gray-400'>Nota del cliente</p>
          <p className='font-sans text-sm text-gray-700'>{booking.customer_notes}</p>
        </div>
      )}

      {booking.participants && booking.participants.length > 0 && (
        <div className='mt-3'>
          <p className='mb-1.5 font-sans text-xs font-bold text-gray-500'>Participantes</p>
          <div className='space-y-1'>
            {booking.participants.map((p, i) => (
              <div key={i} className='flex items-center gap-3 font-sans text-xs text-gray-700'>
                <span className='font-semibold'>{p.name}</span>
                <span className='text-gray-400'>DNI {p.dni}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SessionDetail() {
  const { id, sessionId } = useParams<{ id: string; sessionId: string }>();
  const [session, setSession] = useState<SessionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || !sessionId) return;
    activityService
      .getSessionDetail(Number(id), Number(sessionId))
      .then(setSession)
      .catch(() => setError('No se pudo cargar la sesión. Verificá que tengas acceso.'))
      .finally(() => setLoading(false));
  }, [id, sessionId]);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-sage-50 px-6'>
        <XCircle size={40} className='text-red-400' />
        <p className='font-sans text-gray-600'>{error ?? 'Sesión no encontrada.'}</p>
        <Link
          to={`/activity/${id}`}
          className='rounded-xl bg-teal-700 px-5 py-2.5 font-sans text-sm font-bold text-white hover:bg-teal-800 transition'>
          Volver a la actividad
        </Link>
      </div>
    );
  }

  async function handleConfirmBooking(bookingId: number) {
    await bookingService.confirmBooking(bookingId);
    setSession((prev) =>
      prev
        ? {
            ...prev,
            bookings: prev.bookings.map((b) =>
              b.id === bookingId ? { ...b, status: 'CONFIRMED' as const } : b,
            ),
          }
        : prev,
    );
  }

  const { date, time } = formatDatetime(session.datetime);
  const activity = session.activity;
  const activeBookings = session.bookings.filter((b) => b.status !== 'CANCELLED');
  const cancelledBookings = session.bookings.filter((b) => b.status === 'CANCELLED');

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <div className='mx-auto max-w-3xl px-4 py-8'>

        {/* Back link */}
        <Link
          to={`/activity/${id}`}
          className='mb-6 inline-flex items-center gap-2 font-sans text-sm font-semibold text-teal-700 hover:text-teal-900 transition'>
          <ArrowLeft size={16} />
          Volver a la actividad
        </Link>

        {/* Session header */}
        <div className='mb-6 overflow-hidden rounded-3xl bg-teal-800 p-6 text-white shadow-lg'>
          <p className='font-sans text-xs font-bold uppercase tracking-widest text-teal-300'>
            {activity.title}
          </p>
          <h1 className='mt-1 font-display text-[2.2rem] uppercase leading-none tracking-[0.04em]'>
            <span className='capitalize'>{date}</span>
          </h1>
          <div className='mt-2 flex flex-wrap items-center gap-4'>
            <span className='inline-flex items-center gap-1.5 font-sans text-sm text-teal-200'>
              <Clock size={14} />
              {time} hs
            </span>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-0.5 font-sans text-xs font-bold ${SESSION_STATUS_CLASSES[session.status] ?? 'bg-white/10 text-white border-white/20'}`}>
              {SESSION_STATUS_LABEL[session.status] ?? session.status}
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className='mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3'>
          <div className='rounded-2xl bg-white p-4 shadow-sm border border-gray-100'>
            <div className='mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50'>
              <Users size={18} className='text-teal-700' />
            </div>
            <p className='font-display text-2xl text-gray-800'>{session.booked_spots}</p>
            <p className='font-sans text-xs text-gray-500'>Lugares reservados</p>
          </div>

          <div className='rounded-2xl bg-white p-4 shadow-sm border border-gray-100'>
            <div className='mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50'>
              <CheckCircle size={18} className='text-teal-700' />
            </div>
            <p className='font-display text-2xl text-gray-800'>
              {session.remaining_spots != null ? session.remaining_spots : '∞'}
            </p>
            <p className='font-sans text-xs text-gray-500'>Lugares disponibles</p>
          </div>

          <div className='rounded-2xl bg-white p-4 shadow-sm border border-gray-100 col-span-2 sm:col-span-1'>
            <div className='mb-1 flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50'>
              <DollarSign size={18} className='text-teal-700' />
            </div>
            <p className='font-display text-2xl text-gray-800'>
              ${formatPrice(activeBookings.reduce((s, b) => s + b.total_price, 0))}
            </p>
            <p className='font-sans text-xs text-gray-500'>Total confirmado + pendiente</p>
          </div>
        </div>

        {/* Activity quick info */}
        <div className='mb-6 rounded-2xl bg-white p-5 shadow-sm border border-gray-100'>
          <h2 className='mb-3 font-display text-xl uppercase tracking-[0.04em] text-teal-900'>
            Info de la actividad
          </h2>
          <div className='flex flex-wrap gap-3 text-sm'>
            <span className='inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-sans text-sage-800'>
              <DollarSign size={13} className='text-sage-600' />
              ${formatPrice(activity.base_price)} {activity.currency} / persona
            </span>
            {activity.location && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-sans text-sage-800'>
                <MapPin size={13} className='text-sage-600' />
                {activity.location}
              </span>
            )}
            {activity.duration_minutes && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-sans text-sage-800'>
                <Clock size={13} className='text-sage-600' />
                {activity.duration_minutes >= 60
                  ? `${Math.floor(activity.duration_minutes / 60)}h${activity.duration_minutes % 60 ? ` ${activity.duration_minutes % 60}m` : ''}`
                  : `${activity.duration_minutes} min`}
              </span>
            )}
            {activity.difficulty && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-sans text-sage-800'>
                <Mountain size={13} className='text-sage-600' />
                {activity.difficulty}
              </span>
            )}
            {activity.max_participants && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-sans text-sage-800'>
                <Users size={13} className='text-sage-600' />
                Máx. {activity.max_participants} personas
              </span>
            )}
            {activity.meeting_point && (
              <span className='inline-flex items-center gap-1.5 rounded-full bg-sage-50 px-3 py-1 font-sans text-sage-800'>
                <CalendarDays size={13} className='text-sage-600' />
                {activity.meeting_point}
              </span>
            )}
          </div>
        </div>

        {/* Bookings */}
        <div>
          <h2 className='mb-4 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>
            Reservas activas
            <span className='ml-2 font-sans text-base font-normal text-gray-400'>({activeBookings.length})</span>
          </h2>

          {activeBookings.length === 0 ? (
            <div className='rounded-2xl border border-gray-100 bg-white p-8 text-center'>
              <CalendarDays size={36} className='mx-auto mb-3 text-gray-200' />
              <p className='font-sans text-sm text-gray-400'>No hay reservas activas para esta sesión.</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {activeBookings.map((b) => (
                <BookingCard key={b.id} booking={b} onConfirm={handleConfirmBooking} />
              ))}
            </div>
          )}

          {cancelledBookings.length > 0 && (
            <div className='mt-8'>
              <h3 className='mb-3 font-display text-lg uppercase tracking-[0.04em] text-gray-400'>
                Canceladas
                <span className='ml-2 font-sans text-sm font-normal'>({cancelledBookings.length})</span>
              </h3>
              <div className='space-y-3'>
                {cancelledBookings.map((b) => (
                  <BookingCard key={b.id} booking={b} />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
