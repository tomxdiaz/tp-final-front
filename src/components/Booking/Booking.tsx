import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  /*CreditCard,*/
  Minus,
  Plus,
  QrCode,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { activityService } from '../../services/activity.service';
import { bookingService } from '../../services/booking.service';
import { ApiError } from '../../lib/apiClient';
import { useAuth } from '../../auth/useAuth';
import type { Activity, ActivitySession, Booking as BookingType, BookingPerson } from '../../types/types';

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const BOOKING_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
};

const STEPS = [
  { label: 'Fecha', icon: CalendarDays },
  { label: 'Personas', icon: Users },
  { label: 'Confirmar', icon: ShieldCheck },
  { label: 'Ticket', icon: QrCode },
] as const;

// ─── helpers ──────────────────────────────────────────────────────────────────

function dateKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatLongDate(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`;
}

function formatTime(value: string | Date): string {
  const d = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }).format(d);
}

function formatPrice(price: number): string {
  return price.toLocaleString('es-AR');
}

function availableSpots(session: ActivitySession, maxParticipants: number | null): number {
  if (maxParticipants == null) return Number.POSITIVE_INFINITY;
  return Math.max(0, maxParticipants - session.booked_spots);
}

function isBookable(session: ActivitySession, maxParticipants: number | null): boolean {
  return session.status === 'AVAILABLE' && availableSpots(session, maxParticipants) > 0 && new Date(session.datetime) >= startOfToday();
}

// ─── activity mini card ───────────────────────────────────────────────────────

function ActivityCard({ activity }: { activity: Activity }) {
  const image = activity.images[0];
  return (
    <div className='flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm'>
      <div className='h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-teal-100'>
        {image && <img src={image} alt={activity.title} className='h-full w-full object-cover' />}
      </div>
      <div className='min-w-0'>
        <p className='truncate font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>
          {activity.category?.name ?? 'Actividad'}
          {activity.location ? ` · ${activity.location}` : ''}
        </p>
        <h2 className='truncate font-display text-2xl uppercase tracking-[0.03em] text-teal-900'>{activity.title}</h2>
      </div>
    </div>
  );
}

// ─── stepper ──────────────────────────────────────────────────────────────────

function Stepper({ current }: { current: number }) {
  return (
    <div className='mb-8 flex items-center'>
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isDone = index < current;
        const isActive = index === current;
        return (
          <div key={step.label} className='flex flex-1 items-center last:flex-none'>
            <div className='flex flex-col items-center gap-2'>
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition ${
                  isDone
                    ? 'border-sage-600 bg-sage-600 text-white'
                    : isActive
                      ? 'border-teal-900 bg-teal-900 text-white'
                      : 'border-sage-200 bg-white text-sage-400'
                }`}>
                {isDone ? <Check size={16} /> : <Icon size={16} />}
              </div>
              <span className={`font-sans text-xs font-bold ${isActive || isDone ? 'text-teal-900' : 'text-sage-400'}`}>{step.label}</span>
            </div>
            {index < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 ${isDone ? 'bg-sage-600' : 'bg-sage-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

// ─── main ─────────────────────────────────────────────────────────────────────

export default function Booking() {
  const { id } = useParams<{ id: string }>();
  const { loading: authLoading } = useAuth();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(!id);

  const [step, setStep] = useState(0);
  const [monthOverride, setMonthOverride] = useState<Date | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [participants, setParticipants] = useState<BookingPerson[]>([{ name: '', dni: '' }]);
  const [customerNotes, setCustomerNotes] = useState('');
  // const [cardNumber, setCardNumber] = useState('');
  // const [cardExpiry, setCardExpiry] = useState('');
  // const [cardCvv, setCardCvv] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [booking, setBooking] = useState<BookingType | null>(null);

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

  const maxParticipants = activity?.max_participants ?? null;

  // available sessions grouped by local day
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, ActivitySession[]>();
    if (!activity?.sessions) return map;

    for (const s of activity.sessions) {
      if (!isBookable(s, maxParticipants)) continue;
      const key = dateKey(new Date(s.datetime));
      const list = map.get(key) ?? [];
      list.push(s);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
    }
    return map;
  }, [activity, maxParticipants]);

  // default the calendar to the first month that has availability
  const firstAvailableMonth = useMemo(() => {
    const all = [...sessionsByDate.values()].flat();
    if (all.length === 0) return null;
    const earliest = all.reduce((min, s) => {
      const d = new Date(s.datetime);
      return d < min ? d : min;
    }, new Date(all[0].datetime));
    return new Date(earliest.getFullYear(), earliest.getMonth(), 1);
  }, [sessionsByDate]);

  const calendarMonth = monthOverride ?? firstAvailableMonth ?? startOfToday();

  const selectedDaySessions = useMemo(() => {
    if (!selectedDate) return [];
    return sessionsByDate.get(dateKey(selectedDate)) ?? [];
  }, [selectedDate, sessionsByDate]);

  const selectedSession = useMemo(() => activity?.sessions?.find((s) => s.id === selectedSessionId) ?? null, [activity, selectedSessionId]);

  const maxPeople = useMemo(() => {
    if (!selectedSession) return maxParticipants ?? 1;
    const spots = availableSpots(selectedSession, maxParticipants);
    return Number.isFinite(spots) ? spots : (maxParticipants ?? 99);
  }, [selectedSession, maxParticipants]);

  if (loading || authLoading) {
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

  const totalPrice = activity.base_price * numberOfPeople;

  // ── helpers ──
  const setCount = (n: number) => {
    setNumberOfPeople(n);
    setParticipants((prev) => {
      if (n > prev.length) return [...prev, ...Array.from({ length: n - prev.length }, () => ({ name: '', dni: '' }))];
      return prev.slice(0, n);
    });
  };

  const updateParticipant = (index: number, field: keyof BookingPerson, value: string) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? { ...p, [field]: value } : p)));
  };

  // ── handlers ──
  const handleSelectDay = (date: Date) => {
    const daySessions = sessionsByDate.get(dateKey(date)) ?? [];
    if (daySessions.length === 0) return;
    setSelectedDate(date);
    setSelectedSessionId(daySessions.length === 1 ? daySessions[0].id : null);
    setCount(1);
  };

  const handleConfirm = async () => {
    if (!selectedSessionId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await bookingService.createBooking({
        activity_session_id: selectedSessionId,
        number_of_people: numberOfPeople,
        customer_notes: customerNotes.trim() || undefined,
        participants: participants.map((p) => ({ name: p.name.trim(), dni: p.dni.trim() })),
      });
      setBooking(result);
      setStep(3);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'No pudimos confirmar tu reserva. Intentá nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── calendar cells ──
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const leadingBlanks = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: leadingBlanks }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  const canGoPrev = new Date(year, month, 1) > startOfToday();

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <div className='mx-auto max-w-2xl px-6 py-8'>
        {/* back to activity / previous step */}
        {step > 0 && step < 3 ? (
          <button
            onClick={() => setStep((s) => s - 1)}
            className='mb-4 flex items-center gap-2 font-sans text-body font-bold text-sage-600 transition hover:text-teal-800'>
            <ArrowLeft size={18} />
            Paso anterior
          </button>
        ) : step === 0 ? (
          <Link
            to={`/activity/${activity.id}`}
            className='mb-4 flex items-center gap-2 font-sans text-body font-bold text-sage-600 transition hover:text-teal-800'>
            <ArrowLeft size={18} />
            Volver a la actividad
          </Link>
        ) : null}

        <Stepper current={step} />

        {step < 3 && (
          <div className='mb-6'>
            <ActivityCard activity={activity} />
          </div>
        )}

        {/* ── STEP 1: Fecha ── */}
        {step === 0 && (
          <div className='space-y-6'>
            <div>
              <h1 className='font-display text-3xl uppercase tracking-[0.04em] text-teal-900'>Elegí la fecha</h1>
              <p className='mt-1 font-sans text-sm text-earth-600'>Seleccioná el día en que querés vivir esta experiencia</p>
            </div>

            {sessionsByDate.size === 0 ? (
              <div className='rounded-2xl bg-white p-8 text-center shadow-sm'>
                <p className='font-sans text-body font-bold text-teal-900'>No hay fechas disponibles por el momento.</p>
              </div>
            ) : (
              <>
                <div className='rounded-2xl bg-white p-6 shadow-sm'>
                  <div className='mb-4 flex items-center justify-between'>
                    <button
                      disabled={!canGoPrev}
                      onClick={() => setMonthOverride(new Date(year, month - 1, 1))}
                      className='flex h-9 w-9 items-center justify-center rounded-full text-teal-800 transition hover:bg-sage-100 disabled:cursor-not-allowed disabled:text-sage-200'>
                      <ChevronLeft size={20} />
                    </button>
                    <span className='font-display text-xl uppercase tracking-[0.04em] text-teal-900'>
                      {MONTHS[month]} {year}
                    </span>
                    <button
                      onClick={() => setMonthOverride(new Date(year, month + 1, 1))}
                      className='flex h-9 w-9 items-center justify-center rounded-full text-teal-800 transition hover:bg-sage-100'>
                      <ChevronRight size={20} />
                    </button>
                  </div>

                  <div className='grid grid-cols-7 gap-1'>
                    {WEEKDAYS.map((wd) => (
                      <div key={wd} className='py-2 text-center font-sans text-xs font-bold uppercase text-sage-600'>
                        {wd}
                      </div>
                    ))}
                    {cells.map((date, i) => {
                      if (!date) return <div key={`b${i}`} />;
                      const hasSessions = sessionsByDate.has(dateKey(date));
                      const isSelected = selectedDate != null && isSameDay(date, selectedDate);
                      return (
                        <button
                          key={dateKey(date)}
                          disabled={!hasSessions}
                          onClick={() => handleSelectDay(date)}
                          className={`flex aspect-square items-center justify-center rounded-xl font-sans text-sm transition ${
                            isSelected
                              ? 'bg-teal-800 font-bold text-white'
                              : hasSessions
                                ? 'font-bold text-teal-900 hover:bg-sage-100'
                                : 'cursor-not-allowed text-sage-400'
                          }`}>
                          {date.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* session selector below the calendar */}
                {selectedDate && (
                  <div className='space-y-3'>
                    <div className='flex items-center gap-3 rounded-2xl bg-sage-100 px-5 py-4'>
                      <CalendarDays size={18} className='text-sage-600' />
                      <div>
                        <p className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Fecha seleccionada</p>
                        <p className='font-sans text-body font-bold text-teal-900'>{formatLongDate(selectedDate)}</p>
                      </div>
                    </div>

                    <div className='rounded-2xl bg-white p-5 shadow-sm'>
                      <p className='mb-3 font-sans text-sm font-bold text-teal-900'>
                        {selectedDaySessions.length > 1 ? 'Elegí el horario' : 'Tu sesión'}
                      </p>
                      <div className='flex flex-wrap gap-3'>
                        {selectedDaySessions.map((s) => {
                          const isChosen = s.id === selectedSessionId;
                          const single = selectedDaySessions.length === 1;
                          const spots = availableSpots(s, maxParticipants);
                          return (
                            <button
                              key={s.id}
                              disabled={single}
                              onClick={() => {
                                setSelectedSessionId(s.id);
                                setCount(1);
                              }}
                              className={`rounded-xl border-2 px-4 py-3 text-left transition ${
                                isChosen ? 'border-teal-800 bg-teal-50' : 'border-sage-200 hover:border-teal-400'
                              } ${single ? 'cursor-default' : ''}`}>
                              <span className='block font-sans text-body font-bold text-teal-900'>{formatTime(s.datetime)}</span>
                              {Number.isFinite(spots) && <span className='block font-sans text-xs text-sage-600'>{spots} lugares</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <button
              disabled={!selectedSessionId}
              onClick={() => setStep(1)}
              className='flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-800 px-6 py-4 font-sans text-body font-bold text-white shadow-md transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-sage-400'>
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 2: Personas ── */}
        {step === 1 && (
          <div className='space-y-6'>
            <div>
              <h1 className='font-display text-3xl uppercase tracking-[0.04em] text-teal-900'>¿Cuántos van?</h1>
              {maxParticipants != null && (
                <p className='mt-1 font-sans text-sm text-earth-600'>Máximo {maxParticipants} personas por grupo</p>
              )}
            </div>

            <div className='flex items-center justify-between rounded-2xl bg-white p-6 shadow-sm'>
              <div>
                <p className='font-sans text-body font-bold text-teal-900'>Personas</p>
                <p className='font-sans text-sm text-sage-600'>${formatPrice(activity.base_price)} por persona</p>
              </div>
              <div className='flex items-center gap-4'>
                <button
                  disabled={numberOfPeople <= 1}
                  onClick={() => setCount(Math.max(1, numberOfPeople - 1))}
                  className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-sage-200 text-teal-800 transition hover:border-teal-400 disabled:cursor-not-allowed disabled:text-sage-300'>
                  <Minus size={18} />
                </button>
                <span className='w-6 text-center font-sans text-body-large font-bold text-teal-900'>{numberOfPeople}</span>
                <button
                  disabled={numberOfPeople >= maxPeople}
                  onClick={() => setCount(Math.min(maxPeople, numberOfPeople + 1))}
                  className='flex h-10 w-10 items-center justify-center rounded-full border-2 border-sage-200 text-teal-800 transition hover:border-teal-400 disabled:cursor-not-allowed disabled:text-sage-300'>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* participant details */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <p className='font-sans text-body font-bold text-teal-900'>Datos de los participantes</p>
              <p className='mb-4 font-sans text-sm text-sage-600'>Nombre y DNI de cada persona que asistirá</p>
              <div className='space-y-4'>
                {participants.map((p, i) => (
                  <div key={i} className='rounded-xl border-2 border-sage-100 p-4'>
                    <p className='mb-3 font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Persona {i + 1}</p>
                    <div className='grid grid-cols-2 gap-3'>
                      <div>
                        <label className='mb-1 block font-sans text-xs text-sage-600'>Nombre completo</label>
                        <input
                          type='text'
                          value={p.name}
                          onChange={(e) => updateParticipant(i, 'name', e.target.value)}
                          placeholder='Juan Pérez'
                          className='w-full rounded-xl border-2 border-sage-200 px-3 py-2 font-sans text-sm text-teal-900 outline-none transition focus:border-teal-600'
                        />
                      </div>
                      <div>
                        <label className='mb-1 block font-sans text-xs text-sage-600'>DNI</label>
                        <input
                          type='text'
                          inputMode='numeric'
                          value={p.dni}
                          onChange={(e) => updateParticipant(i, 'dni', e.target.value.replace(/\D/g, ''))}
                          placeholder='45746767'
                          className='w-full rounded-xl border-2 border-sage-200 px-3 py-2 font-sans text-sm text-teal-900 outline-none transition focus:border-teal-600'
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* customer_notes replaces the "Extras" block */}
            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <label htmlFor='customer_notes' className='mb-1 block font-sans text-body font-bold text-teal-900'>
                Notas para el guía
              </label>
              <p className='mb-3 font-sans text-sm text-sage-600'>Contanos cualquier cosa que debamos saber (opcional)</p>
              <textarea
                id='customer_notes'
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                rows={4}
                placeholder='Restricciones alimentarias, experiencia previa, edades, etc.'
                className='w-full resize-none rounded-xl border-2 border-sage-200 px-4 py-3 font-sans text-body text-teal-900 outline-none transition focus:border-teal-600'
              />
            </div>

            <div className='rounded-2xl bg-sage-100 p-5'>
              <div className='flex items-center justify-between font-sans text-sm text-sage-800'>
                <span>
                  ${formatPrice(activity.base_price)} × {numberOfPeople} persona{numberOfPeople === 1 ? '' : 's'}
                </span>
                <span>${formatPrice(totalPrice)}</span>
              </div>
              <div className='mt-3 flex items-center justify-between border-t border-sage-200 pt-3'>
                <span className='font-sans text-body font-bold text-teal-900'>Total</span>
                <span className='font-display text-3xl text-teal-900'>
                  ${formatPrice(totalPrice)} {activity.currency}
                </span>
              </div>
            </div>

            <button
              disabled={!participants.every((p) => p.name.trim() && p.dni.trim())}
              onClick={() => setStep(2)}
              className='flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-800 px-6 py-4 font-sans text-body font-bold text-white shadow-md transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-sage-400'>
              Continuar <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* ── STEP 3: Confirmar ── */}
        {step === 2 && (
          <div className='space-y-6'>
            <div>
              <h1 className='font-display text-3xl uppercase tracking-[0.04em] text-teal-900'>Confirmá tu reserva</h1>
              <p className='mt-1 font-sans text-sm text-earth-600'>Revisá los detalles antes de pagar</p>
            </div>

            <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <div className='space-y-3'>
                <SummaryRow label='Actividad' value={activity.title} />
                {selectedSession && <SummaryRow label='Fecha' value={formatLongDate(selectedSession.datetime)} />}
                {selectedSession && <SummaryRow label='Horario' value={formatTime(selectedSession.datetime)} />}
                <SummaryRow label='Personas' value={`${numberOfPeople} persona${numberOfPeople === 1 ? '' : 's'}`} />
                {activity.meeting_point && <SummaryRow label='Punto de encuentro' value={activity.meeting_point} />}
                {customerNotes.trim() && <SummaryRow label='Notas' value={customerNotes.trim()} />}
              </div>
              {participants.length > 0 && (
                <div className='mt-4 border-t border-sage-200 pt-4'>
                  <p className='mb-3 font-sans text-sm font-bold text-teal-900'>Participantes</p>
                  <div className='space-y-2'>
                    {participants.map((p, i) => (
                      <div key={i} className='flex items-center justify-between'>
                        <span className='font-sans text-sm text-sage-600'>Persona {i + 1}</span>
                        <span className='font-sans text-sm font-bold text-teal-900'>
                          {p.name} · DNI {p.dni}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className='mt-4 flex items-center justify-between border-t border-sage-200 pt-4'>
                <span className='font-sans text-body font-bold text-teal-900'>Total a pagar</span>
                <span className='font-display text-3xl text-teal-900'>
                  ${formatPrice(totalPrice)} {activity.currency}
                </span>
              </div>
            </div>

            {/* visual-only payment mock */}
            {/* <div className='rounded-2xl bg-white p-6 shadow-sm'>
              <h3 className='mb-4 font-sans text-body font-bold text-teal-900'>Datos de pago</h3>
              <div className='space-y-4'>
                <div>
                  <label htmlFor='card' className='mb-1 block font-sans text-sm text-sage-600'>
                    Número de tarjeta
                  </label>
                  <div className='flex items-center gap-2 rounded-xl border-2 border-sage-200 px-4 py-3 transition focus-within:border-teal-600'>
                    <CreditCard size={18} className='text-sage-400' />
                    <input
                      id='card'
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      inputMode='numeric'
                      placeholder='4242 4242 4242 4242'
                      className='w-full bg-transparent font-sans text-body text-teal-900 outline-none placeholder:text-sage-400'
                    />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label htmlFor='exp' className='mb-1 block font-sans text-sm text-sage-600'>
                      Vencimiento
                    </label>
                    <input
                      id='exp'
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      placeholder='MM/AA'
                      className='w-full rounded-xl border-2 border-sage-200 px-4 py-3 font-sans text-body text-teal-900 outline-none transition placeholder:text-sage-400 focus:border-teal-600'
                    />
                  </div>
                  <div>
                    <label htmlFor='cvv' className='mb-1 block font-sans text-sm text-sage-600'>
                      CVV
                    </label>
                    <input
                      id='cvv'
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      inputMode='numeric'
                      placeholder='123'
                      className='w-full rounded-xl border-2 border-sage-200 px-4 py-3 font-sans text-body text-teal-900 outline-none transition placeholder:text-sage-400 focus:border-teal-600'
                    />
                  </div>
                </div>
              </div>
            </div> */}

            {submitError && <div className='rounded-2xl bg-red-50 px-5 py-4 font-sans text-sm font-bold text-red-700'>{submitError}</div>}

            <button
              disabled={submitting}
              onClick={handleConfirm}
              className='flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-800 px-6 py-4 font-sans text-body font-bold text-white shadow-md transition hover:bg-teal-900 disabled:cursor-not-allowed disabled:bg-sage-400'>
              <ShieldCheck size={18} />
              {submitting ? 'Procesando…' : `Confirmar $${formatPrice(totalPrice)} ${activity.currency}`}
            </button>
          </div>
        )}

        {/* ── STEP 4: Ticket (renders the Booking response) ── */}
        {step === 3 && booking && <Ticket booking={booking} />}
      </div>
    </div>
  );
}

// ─── summary row ──────────────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className='flex items-start justify-between gap-4'>
      <span className='font-sans text-sm text-sage-600'>{label}</span>
      <span className='text-right font-sans text-body font-bold text-teal-900'>{value}</span>
    </div>
  );
}

// ─── ticket (step 4) ──────────────────────────────────────────────────────────

function Ticket({ booking }: { booking: BookingType }) {
  const session = booking.activity_session;
  const customerName = [booking.app_user.first_name, booking.app_user.last_name].filter(Boolean).join(' ').trim();

  return (
    <div className='space-y-8'>
      <div className='flex flex-col items-center text-center'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-sage-600 text-white'>
          <Check size={32} />
        </div>
        <h1 className='mt-4 font-display text-4xl uppercase tracking-[0.04em] text-teal-900'>
          ¡Reserva {BOOKING_STATUS_LABELS[booking.status] ?? booking.status}!
        </h1>
        <p className='mt-2 font-sans text-sm text-earth-600'>Ya podés disfrutar tu próxima aventura en Patagonia</p>
      </div>

      <div className='overflow-hidden rounded-3xl bg-white shadow-xl'>
        {/* header */}
        <div className='bg-teal-900 p-6 text-white'>
          <p className='font-sans text-xs font-bold uppercase tracking-[0.2em] text-sage-200'>Ticket digital Ando</p>
          <p className='font-sans text-xs text-teal-200'>Mostrá este ticket a tu guía</p>
          <h2 className='mt-3 font-display text-3xl uppercase tracking-[0.03em] text-white'>{session?.activity.title ?? 'Actividad'}</h2>
        </div>

        {/* body — only fields from the Booking response */}
        <div className='grid grid-cols-2 gap-y-5 p-6'>
          {session && <TicketField label='Fecha' value={formatLongDate(session.datetime)} />}
          {session && <TicketField label='Horario' value={formatTime(session.datetime)} />}
          <TicketField label='Personas' value={`${booking.number_of_people} persona${booking.number_of_people === 1 ? '' : 's'}`} />
          <TicketField label='Total a pagar' value={`$${formatPrice(booking.total_price)}`} />
          {customerName && <TicketField label='Reservado por' value={customerName} />}
          <TicketField label='Estado' value={BOOKING_STATUS_LABELS[booking.status] ?? booking.status} />
          {booking.customer_notes && <TicketField label='Notas' value={booking.customer_notes} />}
        </div>

        {/* participants list */}
        {booking.participants && booking.participants.length > 0 && (
          <div className='mx-6 mb-6 border-t border-sage-100 pt-5'>
            <p className='mb-3 font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>Participantes</p>
            <div className='space-y-2'>
              {booking.participants.map((p, i) => (
                <div key={i} className='flex items-center justify-between'>
                  <span className='font-sans text-sm text-sage-600'>Persona {i + 1}</span>
                  <span className='font-sans text-sm font-bold text-teal-900'>
                    {p.name} · DNI {p.dni}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* reservation code */}
        <div className='mx-6 mb-6 flex items-center gap-4 rounded-2xl bg-sage-50 p-5'>
          <div className='flex h-14 w-14 items-center justify-center rounded-xl bg-teal-900 text-white'>
            <QrCode size={28} />
          </div>
          <div>
            <p className='font-display text-2xl tracking-[0.06em] text-teal-900'>#{booking.id}</p>
            <p className='font-sans text-xs text-sage-600'>Código de reserva. Tu guía lo verificará en el punto de encuentro.</p>
          </div>
        </div>
      </div>

      <div className='flex gap-4'>
        <Link
          to='/'
          className='flex-1 rounded-2xl bg-sage-100 px-6 py-4 text-center font-sans text-body font-bold text-teal-900 transition hover:bg-sage-200'>
          Explorar más
        </Link>
        <Link
          to='/my-bookings'
          className='flex-1 rounded-2xl bg-teal-800 px-6 py-4 text-center font-sans text-body font-bold text-white transition hover:bg-teal-900'>
          Mis reservas
        </Link>
      </div>
    </div>
  );
}

function TicketField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className='font-sans text-xs font-bold uppercase tracking-wide text-sage-600'>{label}</p>
      <p className='mt-1 font-sans text-body font-bold text-teal-900'>{value}</p>
    </div>
  );
}
