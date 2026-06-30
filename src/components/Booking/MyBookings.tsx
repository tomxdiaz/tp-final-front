import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Eye, MapPin, Navigation, Users, XCircle } from 'lucide-react';
import { bookingService } from '../../services/booking.service';
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

function currency(n: number) {
  return `$${n.toLocaleString('es-AR')}`;
}

function shortDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr));
}

function shortTime(dateStr: string) {
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));
}

const MyBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  useEffect(() => {
    bookingService
      .getAllMyBookings()
      .then((data) => setBookings(Array.isArray(data) ? data : [data]))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id: number) => {
    setCancelling(id);
    setConfirmId(null);
    try {
      const updated = await bookingService.cancelBooking(id);
      setBookings((prev) => prev.map((b) => (b.id === id ? updated : b)));
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-sage-50'>
      <div className='bg-teal-800'>
        <div className='mx-auto max-w-5xl px-6 pt-8 pb-6'>
          <p className='text-xs font-sans font-bold text-teal-300 uppercase tracking-widest mb-1'>Mi cuenta</p>
          <h1 className='font-display text-4xl text-white leading-none'>MIS RESERVAS</h1>
        </div>
      </div>

      <div className='mx-auto max-w-5xl px-6 py-8'>
        {bookings.length === 0 ? (
          <div className='bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm shadow-black/5'>
            <CalendarDays size={44} className='text-gray-200 mx-auto mb-3' />
            <p className='text-gray-500 text-sm'>No tenés reservas todavía.</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {bookings.map((b) => {
              const session = b.activity_session;
              const isCancellable = b.status !== 'CANCELLED';
              const isConfirming = confirmId === b.id;
              const isCancelling = cancelling === b.id;

              return (
                <div key={b.id} className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-5'>
                  <div className='flex items-start justify-between gap-4'>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1'>
                        <span className='text-xs font-sans font-semibold text-teal-500'>#{b.id}</span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS_TEXT[b.status]}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[b.status]}`} />
                          {STATUS_LABEL[b.status]}
                        </span>
                      </div>

                      <p className='font-sans font-bold text-gray-800 text-base'>
                        {session ? session.activity.title : <span className='text-gray-400 italic'>Actividad eliminada</span>}
                      </p>

                      <div className='mt-2 flex flex-wrap gap-4 text-sm text-gray-500'>
                        {session && (
                          <span className='flex items-center gap-1.5'>
                            <CalendarDays size={13} className='text-teal-500' />
                            {shortDate(session.datetime)} · {shortTime(session.datetime)}
                          </span>
                        )}
                        <span className='flex items-center gap-1.5'>
                          <Users size={13} className='text-teal-500' />
                          {b.number_of_people} {b.number_of_people === 1 ? 'persona' : 'personas'}
                        </span>
                        {session?.activity.location && (
                          <span className='flex items-center gap-1.5'>
                            <MapPin size={13} className='text-teal-500' />
                            {session.activity.location}
                          </span>
                        )}
                        {session?.activity.meeting_point && (
                          <span className='flex items-center gap-1.5'>
                            <Navigation size={13} className='text-teal-500' />
                            {session.activity.meeting_point}
                          </span>
                        )}
                      </div>

                      {b.customer_notes && <p className='mt-2 text-xs text-gray-400 italic'>"{b.customer_notes}"</p>}
                    </div>

                    <div className='flex flex-col items-end gap-3 shrink-0'>
                      <p className='font-display text-2xl text-gray-800'>{currency(b.total_price)}</p>

                      <button
                        onClick={() => navigate(`/my-bookings/${b.id}`)}
                        className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-teal-600 border border-teal-200 hover:bg-teal-50 transition'>
                        <Eye size={13} />
                        Ver detalle
                      </button>

                      {isCancellable &&
                        (isConfirming ? (
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-gray-500'>¿Confirmar cancelación?</span>
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={isCancelling}
                              className='px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition disabled:opacity-50'>
                              {isCancelling ? 'Cancelando…' : 'Sí, cancelar'}
                            </button>
                            <button
                              onClick={() => setConfirmId(null)}
                              className='px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold hover:bg-gray-200 transition'>
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmId(b.id)}
                            className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 border border-red-200 hover:bg-red-50 transition'>
                            <XCircle size={13} />
                            Cancelar reserva
                          </button>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
