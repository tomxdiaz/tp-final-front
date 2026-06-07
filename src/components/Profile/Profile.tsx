import { CalendarDays, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

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
  const { appUser, loading } = useAuth();

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50 px-6'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  const userEmail = appUser?.email ?? session?.user.email ?? 'Tu cuenta';
  const displayName = [appUser?.first_name, appUser?.last_name].filter(Boolean).join(' ').trim() ?? userEmail;
  const initials = getInitials(displayName || userEmail);
  const contactEmail = userEmail;
  const contactPhone = appUser?.phone ?? null;
  const memberSince = formatSince(appUser?.created_at ?? session?.user.created_at ?? new Date().toISOString());
  const accountRole = appUser?.global_role ?? 'USER';
  const accountCreatedAt = appUser?.created_at ?? session?.user.created_at ?? null;

  const sobreMi = (
    <div className='rounded-3xl bg-white p-6 shadow-md shadow-black/5'>
      <h2 className='font-display text-[2.2rem] uppercase leading-none tracking-[0.04em] text-teal-900'>Mi perfil</h2>

      <div className='mt-6 space-y-3 rounded-2xl bg-sage-50 p-4'>
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <span className='font-bold text-sage-600'>Nombre:</span>
          <span>{appUser?.first_name || 'N/A'}</span>
        </div>
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <span className='font-bold text-sage-600'>Apellido:</span>
          <span>{appUser?.last_name || 'N/A'}</span>
        </div>
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <Mail size={16} className='text-sage-600' />
          <span>{contactEmail}</span>
        </div>
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <Phone size={16} className='text-sage-600' />
          <span>{contactPhone || 'N/A'}</span>
        </div>
        {accountCreatedAt && (
          <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
            <CalendarDays size={16} className='text-sage-600' />
            <span>Cuenta creada {formatDate(accountCreatedAt)}</span>
          </div>
        )}
        <div className='flex items-center gap-3 font-sans text-sm text-sage-800'>
          <ShieldCheck size={16} className='text-sage-600' />
          <span>{accountRole === 'SUPER_USER' ? 'Super Usuario' : 'Usuario'}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <section className='mx-auto max-w-7xl px-6 py-8'>
        <div className='mb-8 overflow-hidden rounded-4xl bg-white shadow-lg shadow-black/5'>
          <div
            className='relative h-[320px] bg-cover bg-center sm:h-[400px]'
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80')",
            }}>
            <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent' />

            <div className='absolute bottom-6 left-6 right-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between'>
              <div className='flex items-end gap-5'>
                <div className='flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-teal-700 shadow-xl'>
                  <span className='font-display text-[2.4rem] uppercase tracking-[0.08em] text-white'>{initials || 'AA'}</span>
                </div>
                <div className='text-white'>
                  <h1 className='font-display text-[2.8rem] uppercase leading-[0.9] tracking-[0.04em] sm:text-[3.8rem]'>{displayName}</h1>
                  <div className='mt-2 flex flex-wrap items-center gap-4 text-sage-100'>
                    <span className='inline-flex items-center gap-2 rounded-full bg-sage-200 px-3 py-1 font-sans text-xs font-bold text-teal-900 sm:text-sm'>
                      En Ando desde {memberSince}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mx-auto max-w-3xl'>{sobreMi}</div>
      </section>
    </div>
  );
}
