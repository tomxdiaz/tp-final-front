import { Search as SearchIcon, Clock as ClockIcon, SlidersHorizontal as SlidersHorizontalIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { categoryService } from '../../services/category.service';
import type { Activity, Category } from '../../types/types';
import { activityService } from '../../services/activity.service';

const difficulties = ['Baja', 'Media', 'Alta', 'Extrema'];

export default function Home() {
  const [searchText, setSearchText] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);

  const hasSelectedCategories = selectedCategories.length > 0;
  const hasSelectedDifficulties = selectedDifficulties.length > 0;
  const hasActiveFilters = hasSelectedCategories || hasSelectedDifficulties;

  const toggleCategory = (categoryName: string) => {
    setSelectedCategories((currentCategories) => {
      const isSelected = currentCategories.includes(categoryName);

      if (isSelected) {
        return currentCategories.filter((category) => category !== categoryName);
      }

      return [...currentCategories, categoryName];
    });
  };

  const toggleDifficulty = (difficultyName: string) => {
    setSelectedDifficulties((currentDifficulties) => {
      const isSelected = currentDifficulties.includes(difficultyName);

      if (isSelected) {
        return currentDifficulties.filter((difficulty) => difficulty !== difficultyName);
      }

      return [...currentDifficulties, difficultyName];
    });
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const clearDifficulties = () => {
    setSelectedDifficulties([]);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedDifficulties([]);
  };

  const normalizedSearchText = searchText.trim().toLowerCase();

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const normalizedTitle = activity.title?.toLowerCase() ?? '';

      const normalizedDifficulty = activity.difficulty?.toLowerCase() ?? '';

      const normalizedCategory = activity.category?.name?.toLowerCase() ?? '';

      const matchesText =
        normalizedSearchText.length === 0 ||
        normalizedTitle.includes(normalizedSearchText) ||
        normalizedDifficulty.includes(normalizedSearchText);

      const matchesCategory =
        !hasSelectedCategories || selectedCategories.some((category) => category.toLowerCase() === normalizedCategory);

      const matchesDifficulty =
        !hasSelectedDifficulties || selectedDifficulties.some((difficulty) => difficulty.toLowerCase() === normalizedDifficulty);

      return matchesText && matchesCategory && matchesDifficulty;
    });
  }, [activities, normalizedSearchText, hasSelectedCategories, hasSelectedDifficulties, selectedCategories, selectedDifficulties]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const allCategories = await categoryService.getAllCategories();

        setCategories(allCategories);
      } catch (error) {
        console.error('Error fetching all categories:', error);

        setCategories([]);
      }
    };

    const fetchActivities = async () => {
      try {
        const allActivities = await activityService.getActivities();

        setActivities(allActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);

        setActivities([]);
      }
    };

    fetchCategories();
    fetchActivities();
  }, []);

  return (
    <div className='min-h-screen bg-sage-50 font-sans text-teal-900'>
      {/* Hero */}
      <section
        className='relative h-[560px] bg-cover bg-center'
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=80')",
        }}>
        <div className='absolute inset-0 bg-linear-to-b from-teal-900/70 via-teal-800/40 to-sage-50' />

        <div className='relative mx-auto flex h-full max-w-7xl items-center px-6'>
          <div className='max-w-3xl pt-8'>
            <p className='mb-5 font-sans text-body font-bold uppercase tracking-[0.28em] text-sage-200'>Patagonia Argentina</p>

            <h1 className='max-w-3xl font-display text-[4.5rem] uppercase leading-[0.95] tracking-[0.04em] text-white md:text-hero-title'>
              Descubrí tu próxima aventura
            </h1>

            <p className='mt-6 max-w-xl font-sans text-body-large text-teal-50'>
              Reservá experiencias outdoor con los mejores guías de la Patagonia. Trekking, kayak, ski, parapente y más.
            </p>

            <div className='mt-10 flex max-w-3xl rounded-2xl bg-white p-4 shadow-xl'>
              <div className='flex flex-1 items-center gap-3 rounded-xl border border-sage-100 px-4'>
                <SearchIcon size={20} className='text-sage-600' />

                <input
                  className='h-14 w-full bg-transparent font-sans text-body text-teal-900 outline-none placeholder:text-sage-600'
                  placeholder='¿Qué experiencia buscás?'
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className='mx-auto max-w-7xl px-6 pt-14 pb-20'>
        <div className='grid grid-cols-1 gap-12 xl:grid-cols-[1fr_220px]'>
          <section>
            {/* Categories */}
            <div className='mb-10'>
              <div className='mb-7 flex items-end justify-between gap-6'>
                <h2 className='font-display text-[2.5rem] uppercase leading-none tracking-[0.04em] text-teal-900 md:text-[3rem]'>
                  Categorías
                </h2>
              </div>

              <div className='flex flex-wrap gap-3'>
                <button
                  type='button'
                  onClick={clearCategories}
                  className={`flex items-center gap-3 rounded-xl px-7 py-4 font-sans text-body font-bold transition hover:scale-[1.02] hover:cursor-pointer ${
                    !hasSelectedCategories ? 'bg-teal-800 text-white shadow-md' : 'bg-white text-teal-800 shadow-sm hover:bg-teal-50'
                  }`}>
                  Todas
                </button>

                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category.name);

                  return (
                    <button
                      key={category.name}
                      type='button'
                      onClick={() => toggleCategory(category.name)}
                      className={`flex items-center gap-3 rounded-xl px-7 py-4 font-sans text-body font-bold transition hover:scale-[1.02] hover:cursor-pointer ${
                        isSelected ? 'bg-teal-800 text-white shadow-md' : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                      }`}>
                      {category.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty filters */}
            <div className='mb-10 flex flex-wrap items-center gap-3'>
              <div className='flex items-center gap-2 font-sans text-body font-bold text-sage-800'>
                <SlidersHorizontalIcon size={18} />
                Dificultad:
              </div>

              <button
                type='button'
                onClick={clearDifficulties}
                className={`rounded-full border px-5 py-2 font-sans text-sm font-bold shadow-sm transition hover:cursor-pointer ${
                  !hasSelectedDifficulties
                    ? 'border-teal-800 bg-teal-800 text-white'
                    : 'border-sage-100 bg-white text-sage-900 hover:bg-sage-50'
                }`}>
                Todas
              </button>

              {difficulties.map((level) => {
                const isSelected = selectedDifficulties.includes(level);

                return (
                  <button
                    key={level}
                    type='button'
                    onClick={() => toggleDifficulty(level)}
                    className={`rounded-full border px-5 py-2 font-sans text-sm font-bold shadow-sm transition hover:cursor-pointer ${
                      isSelected ? 'border-teal-800 bg-teal-800 text-white' : 'border-sage-100 bg-white text-sage-900 hover:bg-sage-50'
                    }`}>
                    {level}
                  </button>
                );
              })}
            </div>

            {/* Section title */}
            <div className='mb-7 flex items-center justify-between'>
              <h2 className='font-display text-[3rem] uppercase leading-none tracking-[0.04em] text-teal-900 md:text-[3.75rem]'>
                Todas las experiencias
              </h2>
            </div>

            {/* Experience cards / Empty state */}
            {filteredActivities.length > 0 ? (
              <div className='grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3'>
                {filteredActivities.map((activity) => {
                  return (
                    <article
                      key={activity.id}
                      className='overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl hover:cursor-pointer'>
                      <div className='relative h-44'>
                        <img src='' alt={activity.title} className='h-full w-full object-cover' />

                        <div className='absolute inset-0 bg-linear-to-b from-teal-900/35 to-transparent' />

                        {activity.category && (
                          <div className='absolute left-4 top-4 flex items-center gap-2 rounded-xl bg-teal-700/80 px-4 py-2 font-sans text-sm font-bold text-white backdrop-blur'>
                            {activity.category.name}
                          </div>
                        )}

                        <div className='absolute bottom-4 left-4 rounded-xl bg-white/90 px-4 py-2 font-sans text-sm font-bold text-teal-900 backdrop-blur'>
                          {activity.difficulty}
                        </div>
                      </div>

                      <div className='p-5'>
                        <h3 className='mb-3 font-display text-[1.5rem] uppercase leading-[1.05] tracking-[0.04em] text-teal-900'>
                          {activity.title}
                        </h3>

                        <div className='mb-5 flex items-center gap-4 font-sans text-sm font-normal text-sage-600'>
                          <span className='flex items-center gap-1'>
                            <ClockIcon size={14} />
                            {activity.duration_minutes} min
                          </span>
                        </div>

                        <div className='flex items-end justify-between'>
                          <div>
                            <span className='font-sans text-[1.35rem] font-bold tracking-wide text-teal-900'>{activity.base_price}</span>

                            <span className='ml-1 font-sans text-sm text-sage-600'>ARS</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className='rounded-2xl border border-sage-100 bg-white px-8 py-14 text-center shadow-sm'>
                <p className='font-sans text-body-large font-bold text-teal-900'>No hay actividades que coincidan con la búsqueda.</p>

                <p className='mt-3 font-sans text-body text-sage-600'>Probá cambiar el texto, las categorías o la dificultad.</p>
              </div>
            )}
          </section>

          {/* Sidebar */}
          <aside className='hidden pt-16 xl:block'>
            <div className='sticky top-8 space-y-10 font-sans text-body font-bold text-sage-600'>
              <div>
                <p>{filteredActivities.length} resultados</p>

                {hasActiveFilters && (
                  <button
                    type='button'
                    onClick={clearAllFilters}
                    className='mb-10 font-sans text-sm font-bold text-sage-600 transition hover:text-teal-800'>
                    Limpiar filtros
                  </button>
                )}

                {hasSelectedCategories && (
                  <div className='mb-8 space-y-2'>
                    <p className='text-sm text-sage-800'>Categorías activas:</p>

                    <div className='flex flex-wrap gap-2'>
                      {selectedCategories.map((category) => (
                        <span key={category} className='rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-800'>
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {hasSelectedDifficulties && (
                  <div className='space-y-2'>
                    <p className='text-sm text-sage-800'>Dificultades activas:</p>

                    <div className='flex flex-wrap gap-2'>
                      {selectedDifficulties.map((difficulty) => (
                        <span key={difficulty} className='rounded-full bg-earth-50 px-3 py-1 text-sm text-earth-800'>
                          {difficulty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
