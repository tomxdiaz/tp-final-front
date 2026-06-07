import { useEffect, useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { adminService } from '../../services/admin.service';
import type { Business } from '../../types/types';

type Filter = 'all' | 'verified' | 'unverified';

const AdminNegocios = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    adminService
      .getAllBusinesses()
      .then(setBusinesses)
      .finally(() => setLoading(false));
  }, []);

  const handleVerify = async (id: number) => {
    setActionLoading(id);
    const updated = await adminService.verifyBusiness(id);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setActionLoading(null);
  };

  const handleDeactivate = async (id: number) => {
    setActionLoading(id);
    const updated = await adminService.deactivateBusiness(id);
    setBusinesses((prev) => prev.map((b) => (b.id === id ? updated : b)));
    setActionLoading(null);
  };

  const filtered = businesses.filter((b) => {
    if (filter === 'verified') return b.verified;
    if (filter === 'unverified') return !b.verified;
    return true;
  });

  if (loading) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-sage-50 px-4 py-10'>
      <div className='mx-auto max-w-4xl'>
        <h1 className='mb-6 font-sans text-2xl font-bold text-teal-900'>Negocios</h1>

        {/* Filter tabs */}
        <div className='mb-6 flex gap-2'>
          {(['all', 'verified', 'unverified'] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'rounded-lg px-4 py-2 text-sm font-bold transition',
                filter === f
                  ? 'bg-teal-700 text-white'
                  : 'bg-white text-teal-800 hover:bg-teal-50 border border-teal-200',
              ].join(' ')}>
              {f === 'all' ? 'Todos' : f === 'verified' ? 'Verificados' : 'No verificados'}
            </button>
          ))}
          <span className='ml-auto self-center text-sm text-gray-500'>
            {filtered.length} resultado{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <p className='text-center text-gray-500 py-12'>No hay negocios para mostrar.</p>
        ) : (
          <ul className='flex flex-col gap-3'>
            {filtered.map((b) => (
              <li
                key={b.id}
                className='flex items-center justify-between gap-4 rounded-xl bg-white px-5 py-4 shadow-sm border border-sage-100'>
                <div className='min-w-0'>
                  <p className='font-sans font-bold text-teal-900 truncate'>{b.business_name}</p>
                  <p className='text-sm text-gray-500 truncate'>{b.contact_email ?? '—'}</p>
                  {b.contact_phone && (
                    <p className='text-sm text-gray-400'>{b.contact_phone}</p>
                  )}
                </div>

                <div className='flex shrink-0 items-center gap-3'>
                  {b.verified ? (
                    <span className='flex items-center gap-1 rounded-full bg-teal-100 px-3 py-1 text-xs font-bold text-teal-700'>
                      <CheckCircle size={13} /> Verificado
                    </span>
                  ) : (
                    <span className='flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600'>
                      <XCircle size={13} /> No verificado
                    </span>
                  )}

                  {b.verified ? (
                    <button
                      disabled={actionLoading === b.id}
                      onClick={() => handleDeactivate(b.id)}
                      className='rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:opacity-50'>
                      {actionLoading === b.id ? '...' : 'Desactivar'}
                    </button>
                  ) : (
                    <button
                      disabled={actionLoading === b.id}
                      onClick={() => handleVerify(b.id)}
                      className='rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 transition hover:bg-teal-100 disabled:opacity-50'>
                      {actionLoading === b.id ? '...' : 'Verificar'}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminNegocios;
