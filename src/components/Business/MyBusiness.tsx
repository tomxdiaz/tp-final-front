import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CalendarDays,
  Clock,
  DollarSign,
  Eye,
  Mail,
  Mountain,
  Pencil,
  Phone,
  PlusCircle,
  RefreshCw,
  Star,
  Trash2,
  Users,
} from 'lucide-react';
import { businessService } from '../../services/business.service';
import { activityService } from '../../services/activity.service';
import type { Activity, Booking, BookingStatus, Business } from '../../types/types';
import { useAuth } from '../../auth/useAuth';

type Tab = 'resumen' | 'actividades' | 'reservas';

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

function durationLabel(minutes: number | null) {
  if (!minutes) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hs` : `${h}h ${m}m`;
}

// ── Pending state ────────────────────────────────────────────────────

const PendingBusiness = ({ business }: { business: Business }) => (
  <div className='min-h-screen bg-gray-50'>
    <div className='mx-auto max-w-2xl px-4 py-8'>
      <div className='mb-8'>
        <h1 className='font-display text-5xl text-teal-800'>MI NEGOCIO</h1>
        <p className='text-sm text-gray-500 mt-1'>Estado de tu solicitud</p>
      </div>

      <div className='bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-start gap-3'>
        <Clock size={20} className='text-amber-500 shrink-0 mt-0.5' />
        <div>
          <p className='text-sm font-semibold text-amber-800'>Pendiente de aprobación</p>
          <p className='text-sm text-amber-700 mt-0.5'>
            Tu negocio fue registrado y está siendo revisado por nuestro equipo. Te notificaremos cuando sea aprobado.
          </p>
        </div>
      </div>

      <div className='bg-white rounded-xl border border-gray-200 p-5'>
        <div className='flex items-center gap-3 pb-4 mb-4 border-b border-gray-100'>
          <div className='w-10 h-10 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center'>
            <Building2 size={18} className='text-teal-700' />
          </div>
          <div>
            <p className='font-semibold text-gray-800'>{business.business_name}</p>
            <p className='text-xs text-gray-400'>Registrado el {new Date(business.created_at).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        {business.description && (
          <div className='flex justify-between py-3 border-b border-gray-100'>
            <span className='text-sm text-gray-500'>Descripción</span>
            <span className='text-sm font-semibold text-gray-800 text-right max-w-[60%]'>{business.description}</span>
          </div>
        )}
        {business.contact_email && (
          <div className='flex justify-between py-3 border-b border-gray-100'>
            <span className='text-sm text-gray-500 flex items-center gap-1.5'>
              <Mail size={13} /> Email
            </span>
            <span className='text-sm font-semibold text-gray-800'>{business.contact_email}</span>
          </div>
        )}
        {business.contact_phone && (
          <div className='flex justify-between py-3'>
            <span className='text-sm text-gray-500 flex items-center gap-1.5'>
              <Phone size={13} /> Teléfono
            </span>
            <span className='text-sm font-semibold text-gray-800'>{business.contact_phone}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// ── Resumen tab ──────────────────────────────────────────────────────

const ResumenTab = ({ business, activities, bookings }: { business: Business; activities: Activity[]; bookings: Booking[] }) => {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const monthlyIncome = bookings
    .filter((b) => {
      if (b.status !== 'CONFIRMED') return false;
      const d = new Date(b.activity_session.datetime);
      return d.getMonth() === month && d.getFullYear() === year;
    })
    .reduce((sum, b) => sum + b.total_price, 0);

  const activeBookings = bookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'PENDING').length;

  const upcomingCount = bookings.filter((b) => {
    if (b.status === 'CANCELLED') return false;
    const d = new Date(b.activity_session.datetime);
    return d >= now && d <= nextWeek;
  }).length;

  const reviews = business.reviews ?? [];
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '—';
  const totalReviews = reviews.length;
  const activeActivities = activities.filter((a) => a.is_active).length;

  const activityBreakdown = activities
    .map((a) => ({
      title: a.title,
      count: bookings
        .filter((b) => b.activity_session.activity.id === a.id && b.status !== 'CANCELLED')
        .reduce((sum, b) => sum + b.number_of_people, 0),
    }))
    .sort((a, b) => b.count - a.count);

  const maxCount = Math.max(...activityBreakdown.map((a) => a.count), 1);

  const recentBookings = [...bookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const stats = [
    {
      icon: <DollarSign size={22} className='text-teal-700' />,
      bg: 'bg-teal-50',
      value: currency(monthlyIncome),
      label: 'Ingresos este mes',
    },
    {
      icon: <CalendarDays size={22} className='text-teal-700' />,
      bg: 'bg-teal-50',
      value: String(activeBookings),
      label: 'Reservas activas',
      sub: `${upcomingCount} próximas esta semana`,
    },
    {
      icon: <Star size={22} className='text-teal-700' />,
      bg: 'bg-teal-50',
      value: avgRating !== '—' ? `${avgRating} ★` : '—',
      label: 'Valoración media',
      sub: `${totalReviews} reseñas totales`,
    },
    {
      icon: <Mountain size={22} className='text-teal-700' />,
      bg: 'bg-teal-50',
      value: String(activities.length),
      label: 'Actividades',
      sub: `${activeActivities} activas`,
    },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {stats.map((s) => (
          <div key={s.label} className='bg-white rounded-2xl p-5 border border-gray-100 shadow-sm shadow-black/5'>
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className='font-display text-3xl text-gray-800 leading-none'>{s.value}</p>
            <p className='text-xs text-gray-500 mt-1.5'>{s.label}</p>
            <p className='text-xs font-bold text-teal-600 mt-0.5'>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-5'>
          <h3 className='font-display text-xl uppercase text-teal-800 mb-4'>Reservas por actividad</h3>
          {activityBreakdown.length === 0 ? (
            <p className='text-sm text-gray-400'>Sin datos aún</p>
          ) : (
            <div className='space-y-3'>
              {activityBreakdown.map((a) => (
                <div key={a.title} className='flex items-center gap-3'>
                  <span className='text-sm text-gray-600 w-32 truncate shrink-0'>{a.title}</span>
                  <div className='flex-1 bg-gray-100 rounded-full h-2.5'>
                    <div className='bg-teal-500 h-2.5 rounded-full transition-all' style={{ width: `${(a.count / maxCount) * 100}%` }} />
                  </div>
                  <span className='text-xs text-gray-500 w-5 text-right shrink-0'>{a.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 p-5'>
          <div className='flex items-center justify-between mb-4'>
            <h3 className='font-display text-xl uppercase text-teal-800'>Últimas reservas</h3>
          </div>
          {recentBookings.length === 0 ? (
            <p className='text-sm text-gray-400'>Sin reservas aún</p>
          ) : (
            <div className='divide-y divide-gray-50'>
              {recentBookings.map((b) => {
                return (
                  <div key={b.id} className='flex items-center justify-between py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center'>
                        <Users size={14} className='text-gray-400' />
                      </div>
                      <div>
                        {b.app_user && <p className='text-sm font-semibold text-gray-800'>{b.app_user.email}</p>}
                        {b.activity_session && b.activity_session.activity && (
                          <p className='text-xs text-teal-600'>{`${b.activity_session.activity.title}`}</p>
                        )}
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-sm font-bold text-gray-800'>{currency(b.total_price)}</p>
                      <span className={`text-xs font-semibold ${STATUS_TEXT[b.status]}`}>
                        <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[b.status]} mr-1`} />
                        {STATUS_LABEL[b.status]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Actividades tab ──────────────────────────────────────────────────

const ActividadesTab = ({
  activities,
  onDeleteActivity,
  onRenewActivity,
}: {
  activities: Activity[];
  onDeleteActivity: (id: number) => Promise<void>;
  onRenewActivity: (id: number) => Promise<void>;
}) => {
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [renewingId, setRenewingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await onDeleteActivity(id);
    setDeletingId(null);
    setConfirmId(null);
  };

  const handleRenew = async (id: number) => {
    setRenewingId(id);
    await onRenewActivity(id);
    setRenewingId(null);
  };

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='font-display text-4xl uppercase text-teal-800'>Mis actividades</h2>
        <Link
          to='/create-activity'
          className='flex items-center gap-2 rounded-xl bg-teal-800 px-5 py-3 font-sans text-sm font-bold text-white hover:bg-teal-700 transition'>
          <PlusCircle size={16} />
          Nueva actividad
        </Link>
      </div>

      {activities.length === 0 ? (
        <div className='bg-white rounded-2xl border border-gray-100 p-10 text-center'>
          <Mountain size={40} className='text-gray-200 mx-auto mb-3' />
          <p className='text-gray-500 text-sm'>Todavía no publicaste ninguna actividad.</p>
          <Link to='/create-activity' className='mt-3 inline-block text-sm font-bold text-teal-600 hover:underline'>
            Publicar primera actividad
          </Link>
        </div>
      ) : (
        <div className='overflow-x-auto rounded-2xl border border-gray-100 shadow-sm shadow-black/5'>
          <div className='bg-white divide-y divide-gray-50 min-w-[640px]'>
            {activities.map((a) => {
              const spotsLabel = a.max_participants !== null ? `${a.max_participants} cupos` : null;
              const dur = durationLabel(a.duration_minutes);
              const isConfirming = confirmId === a.id;
              const isDeleting = deletingId === a.id;
              const isRenewing = renewingId === a.id;

              return (
                <div key={a.id} className='flex items-center gap-4 px-5 py-4'>
                  <div className='relative w-20 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0'>
                    {a.images[0] ? (
                      <img src={a.images[0]} alt={a.title} className='w-full h-full object-cover' />
                    ) : (
                      <div className='w-full h-full flex items-center justify-center'>
                        <Mountain size={20} className='text-gray-300' />
                      </div>
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <p className='font-sans font-bold text-gray-800 text-sm uppercase tracking-wide'>{a.title}</p>
                    <p className='text-xs text-gray-400 mt-0.5 flex items-center gap-2'>
                      {a.location && <span>{a.location}</span>}
                      {dur && <span>· {dur}</span>}
                      {spotsLabel && <span>· {spotsLabel}</span>}
                    </p>
                  </div>

                  <p className='font-bold text-gray-800 shrink-0'>{currency(a.base_price)}</p>

                  <div className='flex items-center gap-1 shrink-0'>
                    {isConfirming ? (
                      <>
                        <span className='text-xs text-red-500 font-semibold mr-1'>¿Eliminar?</span>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={isDeleting}
                          className='px-2.5 py-1 rounded-lg bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition disabled:opacity-60'>
                          {isDeleting ? '...' : 'Sí'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          disabled={isDeleting}
                          className='px-2.5 py-1 rounded-lg border border-gray-300 text-gray-600 text-xs font-bold hover:bg-gray-50 transition disabled:opacity-60'>
                          No
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to={`/activity/${a.id}`}
                          className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition'
                          title='Ver actividad'>
                          <Eye size={16} />
                        </Link>
                        <Link
                          to={`/update-activity/${a.id}`}
                          className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-700 hover:bg-teal-50 transition'
                          title='Editar'>
                          <Pencil size={16} />
                        </Link>
                        <button
                          onClick={() => handleRenew(a.id)}
                          disabled={isRenewing}
                          className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition disabled:opacity-50'
                          title='Renovar sesiones'>
                          <RefreshCw size={16} className={isRenewing ? 'animate-spin' : ''} />
                        </button>
                        <button
                          onClick={() => setConfirmId(a.id)}
                          className='w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition'
                          title='Eliminar'>
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Reservas tab ─────────────────────────────────────────────────────

const ReservasTab = ({ bookings }: { bookings: Booking[] }) => (
  <div>
    <h2 className='font-display text-4xl uppercase text-teal-800 mb-6'>Todas las reservas</h2>

    {bookings.length === 0 ? (
      <div className='bg-white rounded-2xl border border-gray-100 p-10 text-center'>
        <CalendarDays size={40} className='text-gray-200 mx-auto mb-3' />
        <p className='text-gray-500 text-sm'>Todavía no recibiste reservas.</p>
      </div>
    ) : (
      <div className='bg-white rounded-2xl border border-gray-100 shadow-sm shadow-black/5 overflow-x-auto'>
        <table className='min-w-full text-sm'>
          <thead>
            <tr className='border-b border-gray-100'>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-5 py-3'>ID</th>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-4 py-3'>Actividad</th>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-4 py-3'>Cliente</th>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-4 py-3'>Fecha</th>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-4 py-3'>Personas</th>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-4 py-3'>Total</th>
              <th className='text-left font-sans text-xs font-bold text-teal-700 uppercase tracking-widest px-4 py-3'>Estado</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-50'>
            {bookings.map((b) => {
              const userName = b.app_user
                ? `${b.app_user.first_name ?? ''} ${(b.app_user.last_name ?? '').charAt(0)}${b.app_user.last_name ? '.' : ''}`.trim() ||
                  b.app_user.email
                : `Usuario`;
              return (
                <tr key={b.id} className='hover:bg-gray-50/50 transition'>
                  <td className='px-5 py-3.5 font-sans text-xs text-teal-600 font-semibold'>{b.id}</td>
                  <td className='px-4 py-3.5 font-semibold text-gray-800'>{b.activity_session.activity.title}</td>
                  <td className='px-4 py-3.5 text-teal-600 font-semibold'>{userName}</td>
                  <td className='px-4 py-3.5 text-gray-600 whitespace-nowrap'>{shortDate(b.activity_session.datetime)}</td>
                  <td className='px-4 py-3.5 text-gray-800 font-semibold'>{b.number_of_people}</td>
                  <td className='px-4 py-3.5 font-bold text-gray-800'>{currency(b.total_price)}</td>
                  <td className='px-4 py-3.5'>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${STATUS_TEXT[b.status]}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[b.status]}`} />
                      {STATUS_LABEL[b.status]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// ── Dashboard (verified) ─────────────────────────────────────────────

const Dashboard = ({
  business,
  activities,
  bookings,
  firstName,
  onDeleteActivity,
  onRenewActivity,
}: {
  business: Business;
  activities: Activity[];
  bookings: Booking[];
  firstName: string;
  onDeleteActivity: (id: number) => Promise<void>;
  onRenewActivity: (id: number) => Promise<void>;
}) => {
  const [tab, setTab] = useState<Tab>('resumen');

  const tabs: { key: Tab; label: string }[] = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'actividades', label: 'Actividades' },
    { key: 'reservas', label: 'Reservas' },
  ];

  const initials = business.business_name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className='min-h-screen bg-sage-50'>
      <div className='bg-teal-800'>
        <div className='mx-auto max-w-7xl px-6 pt-8 pb-0'>
          <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8'>
            <div className='flex items-center gap-4'>
              <div className='w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-teal-700 border-2 border-teal-600 flex items-center justify-center shrink-0'>
                <span className='font-display text-xl sm:text-2xl text-white'>{initials}</span>
              </div>
              <div>
                <p className='text-xs font-sans font-bold text-teal-300 uppercase tracking-widest'>Panel de Prestador</p>
                <h1 className='font-display text-2xl sm:text-4xl text-white leading-none mt-0.5'>HOLA, {firstName.toUpperCase()} 👋</h1>
              </div>
            </div>
            <Link
              to='/create-activity'
              className='flex items-center justify-center gap-2 rounded-xl border border-teal-600 bg-teal-700/40 px-5 py-3 font-sans text-sm font-bold text-white hover:bg-teal-700 transition sm:w-auto'>
              <PlusCircle size={16} />
              Nueva actividad
            </Link>
          </div>

          <div className='flex w-full gap-1'>
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={[
                  'flex-1 px-2 py-2.5 rounded-t-xl font-sans text-sm font-bold transition text-center',
                  tab === t.key ? 'bg-sage-50 text-teal-800' : 'text-teal-200 hover:text-white',
                ].join(' ')}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className='mx-auto max-w-7xl px-6 py-8'>
        {tab === 'resumen' && <ResumenTab business={business} activities={activities} bookings={bookings} />}
        {tab === 'actividades' && <ActividadesTab activities={activities} onDeleteActivity={onDeleteActivity} onRenewActivity={onRenewActivity} />}
        {tab === 'reservas' && <ReservasTab bookings={bookings} />}
      </div>
    </div>
  );
};

// ── Root component ───────────────────────────────────────────────────

const MyBusiness = () => {
  const { appUser } = useAuth();

  const [business, setBusiness] = useState<Business | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      businessService.getMyBusiness().catch(() => null),
      activityService.getMyBusinessActivities().catch(() => []),
      businessService.getMyBusinessBookings().catch(() => []),
    ]).then(([biz, acts, bkgs]) => {
      setBusiness(biz);
      setActivities(acts ?? []);
      setBookings(bkgs ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  if (!business) {
    return (
      <div className='min-h-screen bg-sage-50 flex items-center justify-center px-6'>
        <div className='text-center'>
          <Building2 size={48} className='text-gray-200 mx-auto mb-4' />
          <p className='text-gray-500 mb-4'>No tenés un perfil de negocio todavía.</p>
          <Link
            to='/create-business'
            className='rounded-xl bg-teal-700 px-6 py-3 font-sans text-sm font-bold text-white hover:bg-teal-600 transition'>
            Crear perfil de negocio
          </Link>
        </div>
      </div>
    );
  }

  if (!business.verified) return <PendingBusiness business={business} />;

  const firstName = appUser?.first_name ?? business.business_name.split(' ')[0];

  const handleDeleteActivity = async (id: number) => {
    await activityService.deleteActivity(id);
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleRenewActivity = async (id: number) => {
    await activityService.renewActivitySessions(id);
  };

  return (
    <Dashboard
      business={business}
      activities={activities}
      bookings={bookings}
      firstName={firstName}
      onDeleteActivity={handleDeleteActivity}
      onRenewActivity={handleRenewActivity}
    />
  );
};

export default MyBusiness;
