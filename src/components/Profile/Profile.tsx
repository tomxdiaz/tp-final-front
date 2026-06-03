import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  Clock3,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { businessService, type BusinessProfileSummary } from '../../services/business.service';
import type { Business } from '../../types/types';
import { activityService } from '../../services/activity.service';
import type { Activity } from '../../types/types';

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function formatSince(value: string): string {
  const createdAt = new Date(value);
  const years = new Date().getFullYear() - createdAt.getFullYear();

  if (years <= 0) {
    return 'Este año';
  }

  return `${years} año${years === 1 ? '' : 's'}`;
}

function getInitials(displayName: string) {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
}

export default function Profile() {
  const { appUser, session, loading } = useAuth();
  const location = useLocation();

  const [summary, setSummary] = useState<BusinessProfileSummary | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!session || !appUser) {
      setSummary(null);
      setBusiness(null);
      setActivities([]);
      setPageLoading(false);
      return;
    }

    let mounted = true;

    const loadProfile = async () => {
      setPageLoading(true);

      try {
        const [summaryData, businessData, myActivities] = await Promise.all([
          businessService.getMyProfileSummary().catch(() => null),
          businessService.getMyBusiness().catch(() => null),
          activityService.getMyBusinessActivities().catch(() => [] as Activity[]),
        ]);

        if (!mounted) {
          return;
        }

        setSummary(summaryData);
        setBusiness(businessData);
        setActivities(myActivities);
      } finally {
        if (mounted) {
          setPageLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, [appUser, loading, session]);

  if (!loading && !session) {
    return <Navigate to='/login' replace state={{ from: location }} />;
  }

  if (loading || pageLoading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50 px-6'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  const userEmail = appUser?.email ?? session?.user.email ?? 'Tu cuenta';
  const displayName = summary?.business.business_name
    ?? [appUser?.first_name, appUser?.last_name].filter(Boolean).join(' ').trim()
    ?? userEmail;
  const initials = getInitials(displayName || userEmail);
  const businessData = business ?? summary?.business ?? null;
  const contactEmail = businessData?.contact_email ?? userEmail;
  const contactPhone = businessData?.contact_phone ?? appUser?.phone ?? null;
  const memberSince = formatSince(summary?.business.created_at ?? appUser?.created_at ?? session?.user.created_at ?? new Date().toISOString());
  const accountRole = appUser?.global_role ?? 'USER';
  const accountCreatedAt = appUser?.created_at ?? session?.user.created_at ?? null;
  const activeActivities = activities.filter((activity) => activity.is_active);
  const yearsOfExperience = summary?.years_of_experience ?? 0;

  const sobreMi = (
    <div className='rounded-3xl bg-white p-6 shadow-md shadow-black/5'>
      <h2 className='font-display text-[2.2rem] uppercase leading-none tracking-[0.04em] text-teal-900'>
        Sobre mí
      </h2>
      <p className='mt-4 font-sans text-body leading-relaxed text-sage-800'>
        {businessData?.description ?? ''}
      </p>

      <div className='mt-6 space-y-3 rounded-2xl bg-sage-50 p-4'>
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <Mail size={16} className='text-sage-600' />
          <span>{contactEmail}</span>
        </div>
        {contactPhone && (
          <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
            <Phone size={16} className='text-sage-600' />
            <span>{contactPhone}</span>
          </div>
        )}
        {accountCreatedAt && (
          <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
            <CalendarDays size={16} className='text-sage-600' />
            <span>Cuenta creada {formatDate(accountCreatedAt)}</span>
          </div>
        )}
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <ShieldCheck size={16} className='text-sage-600' />
          <span>{accountRole === 'SUPER_USER' ? 'Administrador' : 'Usuario'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <section className='mx-auto max-w-7xl px-6 py-8'>
        <Link
          to='/'
          className='mb-6 inline-flex items-center gap-2 font-sans text-sm font-bold text-sage-700 transition hover:text-teal-800'>
          <ArrowLeft size={18} />
          Volver
        </Link>

        <div className='mb-8 overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-black/5'>
          <div
            className='relative h-[320px] bg-cover bg-center sm:h-[400px]'
            style={{ backgroundImage: 'url(\'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80\')' }}>
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent' />

            <div className='absolute left-6 top-6 flex flex-wrap gap-3'>
                {businessData?.verified && (
                <span className='inline-flex items-center gap-2 rounded-full bg-sage-200 px-4 py-2 font-sans text-sm font-bold text-teal-900'>
                  <ShieldCheck size={16} />
                  Negocio verificado
                </span>
              )}
            </div>

            <div className='absolute bottom-6 left-6 right-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
              <div className='flex items-end gap-5'>
                <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-teal-700 shadow-xl'>
                  <span className='font-display text-[2.4rem] uppercase tracking-[0.08em] text-white'>{initials || 'AA'}</span>
                </div>
                <div className='text-white'>
                  <h1 className='font-display text-[2.8rem] uppercase leading-[0.9] tracking-[0.04em] sm:text-[3.8rem]'>
                    {displayName}
                  </h1>
                  <div className='mt-2 flex flex-wrap items-center gap-4 text-sage-100'>
                    <span className='inline-flex items-center gap-2 font-sans text-sm font-bold sm:text-body'>
                      <MapPin size={16} />
                      {businessData?.business_name ? 'El Chaltén, Santa Cruz' : userEmail}
                    </span>

                    <span className='inline-flex items-center gap-2 rounded-full bg-sage-200 px-3 py-1 font-sans text-xs font-bold text-teal-900 sm:text-sm'>
                      En Ando desde {memberSince}
                    </span>
                  </div>
                </div>
              </div>

              <a
                href={`mailto:${contactEmail}`}
                className='inline-flex items-center justify-center gap-2 rounded-2xl bg-sage-200 px-5 py-3 font-sans text-sm font-bold text-teal-900 transition hover:bg-sage-100'>
                <MessageCircle size={16} />
                Contactar
              </a>
            </div>
          </div>
        </div>

        {businessData ? (
          <div className='grid gap-8 xl:grid-cols-[380px_1fr]'>
            <aside className='space-y-6'>
              <div className='rounded-3xl bg-white p-5 shadow-md shadow-black/5'>
                <div className='grid grid-cols-3 gap-3 text-center'>
                  <div className='rounded-2xl border border-sage-100 p-4'>
                    <div className='font-display text-[2.4rem] leading-none text-teal-900'>{activities.length}</div>
                    <div className='mt-1 font-sans text-sm text-sage-700'>Actividades</div>
                  </div>
                  <div className='rounded-2xl border border-sage-100 p-4'>
                    <div className='font-display text-[2.4rem] leading-none text-teal-900'>{yearsOfExperience}</div>
                    <div className='mt-1 font-sans text-sm text-sage-700'>Años exp.</div>
                  </div>
                  <div className='rounded-2xl border border-sage-100 p-4'>
                    <div className='font-display text-[2.4rem] leading-none text-teal-900'>{summary?.review_summary.total_reviews ?? 0}</div>
                    <div className='mt-1 font-sans text-sm text-sage-700'>Reseñas</div>
                  </div>
                </div>
              </div>

              {sobreMi}

            </aside>

            <section>
              <div className='mb-5 flex items-end justify-between gap-4'>
                <div>
                  <p className='font-sans text-xs font-bold uppercase tracking-[0.26em] text-sage-600'>Catálogo propio</p>
                  <h2 className='font-display text-[3rem] uppercase leading-none tracking-[0.04em] text-teal-900'>
                    Actividades de {displayName}
                  </h2>
                </div>
                {activities.length > 0 && (
                  <div className='shrink-0 rounded-full bg-white px-4 py-2 font-sans text-sm font-bold text-sage-700 shadow-sm'>
                    {activeActivities.length} activas de {activities.length}
                  </div>
                )}
              </div>

              <div className='space-y-5'>
                {activities.length > 0 ? (
                  activities.map((activity) => (
                    <Link
                      key={activity.id}
                      to={`/activity/${activity.id}`}
                      className='group grid overflow-hidden rounded-3xl bg-white shadow-md shadow-black/5 transition hover:-translate-y-1 hover:shadow-xl lg:grid-cols-[220px_1fr]'>
                      <div className='relative min-h-48 overflow-hidden'>
                        <img
                          src='https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80'
                          alt={activity.title}
                          className='h-full w-full object-cover transition duration-500 group-hover:scale-105'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent' />
                      </div>

                      <div className='flex flex-col justify-center gap-3 p-6'>
                        <div className='flex flex-wrap items-center gap-2'>
                          {activity.category && (
                            <span className='rounded-full bg-sage-100 px-3 py-1 font-sans text-xs font-bold text-sage-800'>
                              {activity.category.name}
                            </span>
                          )}
                          <span className={`rounded-full px-3 py-1 font-sans text-xs font-bold ${activity.is_active ? 'bg-teal-100 text-teal-700' : 'bg-earth-100 text-earth-800'}`}>
                            {activity.is_active ? 'Activa' : 'Pausada'}
                          </span>
                        </div>

                        <h3 className='font-display text-[2rem] uppercase leading-none tracking-[0.04em] text-teal-900'>
                          {activity.title}
                        </h3>

                        <div className='flex flex-wrap gap-x-4 gap-y-1 font-sans text-sm text-sage-700'>
                          {activity.location && (
                            <span className='inline-flex items-center gap-1.5'>
                              <MapPin size={14} className='text-sage-500' />
                              {activity.location}
                            </span>
                          )}
                          {activity.duration_minutes && (
                            <span className='inline-flex items-center gap-1.5'>
                              <Clock3 size={14} className='text-sage-500' />
                              {activity.duration_minutes} min
                            </span>
                          )}
                          {activity.max_participants && (
                            <span className='inline-flex items-center gap-1.5'>
                              <Users size={14} className='text-sage-500' />
                              Hasta {activity.max_participants} pers.
                            </span>
                          )}
                        </div>

                        <div className='mt-1 border-t border-sage-100 pt-3'>
                          <span className='font-display text-[1.6rem] leading-none text-teal-900'>
                            ${Number(activity.base_price).toLocaleString('es-AR')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className='rounded-3xl border border-dashed border-sage-200 bg-white p-10 shadow-sm'>
                    <div className='mx-auto max-w-xl text-center'>
                      <div className='mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-sage-50 text-sage-600'>
                        <BadgeCheck size={28} />
                      </div>
                      <h3 className='font-display text-[2.4rem] uppercase leading-none tracking-[0.04em] text-teal-900'>
                        Todavía no publicaste actividades
                      </h3>
                      <p className='mt-4 font-sans text-body leading-relaxed text-sage-700'>
                        Cuando el negocio tenga experiencias publicadas, van a aparecer acá con su valor real y sus reseñas reales.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className='mx-auto max-w-3xl'>
            {sobreMi}
          </div>
        )}
      </section>
    </div>
  );
}