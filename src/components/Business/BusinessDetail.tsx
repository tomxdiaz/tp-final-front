import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, Clock, Mail, Phone, Star } from 'lucide-react';
import { businessService } from '../../services/business.service';
import { activityService } from '../../services/activity.service';
import { reviewService } from '../../services/review.service';
import { useAuth } from '../../auth/useAuth';
import type { Activity, Business } from '../../types/types';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          className={star <= rating ? 'fill-amber-400 text-amber-400' : 'fill-sage-200 text-sage-200'}
        />
      ))}
    </div>
  );
}

function InteractiveStars({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className='flex items-center gap-1'>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type='button'
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className='transition'>
          <Star
            size={24}
            className={(hovered || value) >= star ? 'fill-amber-400 text-amber-400' : 'fill-sage-100 text-sage-300'}
          />
        </button>
      ))}
    </div>
  );
}

function averageRating(reviews: Business['reviews']): number | null {
  if (reviews.length === 0) return null;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const { appUser } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(!id);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (!id) return;
    const numId = Number(id);
    Promise.all([
      businessService.getBusinessById(numId),
      activityService.getActivitiesByBusinessId(numId),
    ])
      .then(([biz, acts]) => {
        setBusiness(biz);
        setActivities(Array.isArray(acts) ? acts : [acts as unknown as Activity]);
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

  if (error || !business) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-sage-50'>
        <p className='font-sans text-body-large font-bold text-teal-900'>No pudimos cargar el negocio.</p>
        <Link to='/' className='font-sans text-body font-bold text-teal-700 underline'>
          Volver al inicio
        </Link>
      </div>
    );
  }

  const avg = averageRating(business.reviews);
  const isOwner = appUser?.id === business.app_user_id;
  const existingReview = appUser ? business.reviews.find((r) => r.app_user_id === appUser.id) : undefined;
  const canReview = !!appUser && !isOwner && !existingReview;

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setSubmitError('Seleccioná una puntuación.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');
    try {
      const newReview = await reviewService.createReview({
        business_id: business.id,
        rating,
        comment: comment.trim() || undefined,
      });
      setBusiness((prev) => prev && { ...prev, reviews: [newReview, ...prev.reviews] });
      setRating(0);
      setComment('');
    } catch {
      setSubmitError('No se pudo enviar la reseña. Intentá de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      <div className='mx-auto max-w-4xl px-6 py-8'>
        <Link to={-1 as unknown as string} className='mb-6 flex items-center gap-2 font-sans text-body font-bold text-sage-600 transition hover:text-teal-800'>
          <ArrowLeft size={18} />
          Volver
        </Link>

        {/* Header card */}
        <div className='mb-6 rounded-2xl bg-white p-6 shadow-sm'>
          <div className='mb-4 flex items-start gap-4'>
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-teal-800 text-2xl font-bold text-white'>
              {business.business_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='font-display text-3xl uppercase tracking-[0.04em] text-teal-900'>{business.business_name}</h1>
                {business.verified && (
                  <span className='rounded-full bg-teal-50 px-2 py-0.5 font-sans text-xs font-bold text-teal-700'>Verificado</span>
                )}
              </div>
              {avg !== null && (
                <div className='mt-1 flex items-center gap-2'>
                  <StarRating rating={Math.round(avg)} />
                  <span className='font-sans text-sm font-bold text-teal-900'>{avg.toFixed(1)}</span>
                  <span className='font-sans text-xs text-sage-600'>({business.reviews.length} reseña{business.reviews.length !== 1 ? 's' : ''})</span>
                </div>
              )}
            </div>
          </div>

          {business.description && (
            <p className='mb-5 font-sans text-body leading-relaxed text-sage-800'>{business.description}</p>
          )}

          <div className='flex flex-wrap gap-4'>
            {business.contact_phone && (
              <div className='flex items-center gap-2'>
                <Phone size={15} className='text-sage-600' />
                <span className='font-sans text-sm text-teal-900'>{business.contact_phone}</span>
              </div>
            )}
            {business.contact_email && (
              <div className='flex items-center gap-2'>
                <Mail size={15} className='text-sage-600' />
                <span className='font-sans text-sm text-teal-900'>{business.contact_email}</span>
              </div>
            )}
            {!business.contact_phone && !business.contact_email && (
              <div className='flex items-center gap-2 text-sage-500'>
                <Building2 size={15} />
                <span className='font-sans text-sm'>Sin datos de contacto</span>
              </div>
            )}
          </div>
        </div>

        {/* Activities */}
        <div className='mb-6 rounded-2xl bg-white p-6 shadow-sm'>
          <h2 className='mb-5 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>
            Experiencias{activities.length > 0 && <span className='ml-2 text-sage-500'>({activities.length})</span>}
          </h2>

          {activities.length === 0 ? (
            <p className='font-sans text-sm text-sage-600'>Este negocio aún no tiene actividades publicadas.</p>
          ) : (
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
              {activities.map((activity) => (
                <Link
                  key={activity.id}
                  to={`/activity/${activity.id}`}
                  className='block overflow-hidden rounded-2xl border border-sage-100 transition hover:-translate-y-1 hover:shadow-lg'>
                  <div className='relative h-40'>
                    {activity.images[0] ? (
                      <img src={activity.images[0]} alt={activity.title} className='h-full w-full object-cover' />
                    ) : (
                      <div className='h-full w-full bg-linear-to-b from-teal-800 to-teal-600' />
                    )}
                    <div className='absolute inset-0 bg-linear-to-b from-teal-900/35 to-transparent' />
                    {activity.category && (
                      <span className='absolute left-3 top-3 rounded-xl bg-teal-700/80 px-3 py-1.5 font-sans text-xs font-bold text-white backdrop-blur'>
                        {activity.category.name}
                      </span>
                    )}
                    {activity.difficulty && (
                      <span className='absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-1 font-sans text-xs font-bold text-teal-900 backdrop-blur'>
                        {activity.difficulty}
                      </span>
                    )}
                  </div>
                  <div className='p-4'>
                    <h3 className='mb-2 font-display text-xl uppercase leading-tight tracking-[0.04em] text-teal-900'>
                      {activity.title}
                    </h3>
                    <div className='mb-3 flex items-center gap-3 font-sans text-sm text-sage-600'>
                      {activity.duration_minutes != null && (
                        <span className='flex items-center gap-1'>
                          <Clock size={13} />
                          {activity.duration_minutes} min
                        </span>
                      )}
                    </div>
                    <div className='flex items-end justify-between'>
                      <span className='font-sans text-xl font-bold text-teal-900'>
                        ${activity.base_price.toLocaleString('es-AR')}
                        <span className='ml-1 text-sm font-normal text-sage-600'>{activity.currency} / persona</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className='rounded-2xl bg-white p-6 shadow-sm'>
          <h2 className='mb-5 font-display text-2xl uppercase tracking-[0.04em] text-teal-900'>
            Reseñas{business.reviews.length > 0 && <span className='ml-2 text-sage-500'>({business.reviews.length})</span>}
          </h2>

          {/* Leave a review */}
          {canReview && (
            <form onSubmit={handleSubmitReview} className='mb-6 rounded-xl border border-sage-100 bg-sage-50 p-5'>
              <p className='mb-3 font-sans text-sm font-bold text-teal-900'>Dejá tu reseña</p>
              <InteractiveStars value={rating} onChange={setRating} />
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Contá tu experiencia (opcional)'
                rows={3}
                className='mt-3 w-full resize-none rounded-xl border border-sage-200 bg-white px-4 py-3 font-sans text-sm text-teal-900 outline-none placeholder:text-sage-400 focus:border-teal-400'
              />
              {submitError && <p className='mt-2 font-sans text-xs text-red-500'>{submitError}</p>}
              <button
                type='submit'
                disabled={submitting}
                className='mt-3 rounded-xl bg-teal-800 px-5 py-2.5 font-sans text-sm font-bold text-white transition hover:bg-teal-900 disabled:opacity-60'>
                {submitting ? 'Enviando...' : 'Publicar reseña'}
              </button>
            </form>
          )}

          {/* Reason why review is blocked */}
          {!appUser && (
            <p className='mb-5 font-sans text-sm text-sage-600'>
              <Link to='/login' className='font-bold text-teal-700 underline'>Iniciá sesión</Link> para dejar una reseña.
            </p>
          )}
          {appUser && isOwner && (
            <p className='mb-5 rounded-xl bg-sage-50 px-4 py-3 font-sans text-sm text-sage-600'>
              No podés reseñar tu propio negocio.
            </p>
          )}
          {appUser && existingReview && (
            <div className='mb-5 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3'>
              <p className='font-sans text-sm font-bold text-teal-800'>Ya dejaste una reseña para este negocio.</p>
            </div>
          )}

          {business.reviews.length === 0 ? (
            <p className='font-sans text-sm text-sage-600'>Este negocio aún no tiene reseñas.</p>
          ) : (
            <div className='space-y-4'>
              {business.reviews.map((review) => (
                <div
                  key={review.id}
                  className={`rounded-xl border p-4 ${review.app_user_id === appUser?.id ? 'border-teal-200 bg-teal-50' : 'border-sage-100 bg-sage-50'}`}>
                  <div className='mb-2 flex items-center justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <StarRating rating={review.rating} />
                      {review.app_user_id === appUser?.id && (
                        <span className='rounded-full bg-teal-100 px-2 py-0.5 font-sans text-xs font-bold text-teal-700'>Tu reseña</span>
                      )}
                    </div>
                    <span className='font-sans text-xs text-sage-500'>{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && (
                    <p className='font-sans text-sm leading-relaxed text-teal-900'>{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
