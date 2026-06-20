import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';
import { GlobalRole } from '../../types/types';
import { useEffect, useRef, useState } from 'react';

const Header = () => {
  const { appUser, business, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut();
    navigate('/');
  };

  const canPublish = business?.verified;
  const isSuperUser = appUser?.global_role === GlobalRole.SUPER_USER;

  const navItems = [
    { label: 'Soy turista', to: '/', end: true },
    { label: appUser && business ? 'Mi negocio' : 'Soy prestador', to: '/my-business' },
  ];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className='h-20 bg-teal-800 text-sage-200'>
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between px-6'>
        {/* Left: logo + nav links (nav hidden below md) */}
        <div className='flex items-center gap-10'>
          <Link to='/' className='flex h-8 w-8 items-center justify-center rounded-lg bg-white shrink-0'>
            <img className='h-[80%] w-[80%]' src='/logos/logo_ando.png' alt='Ando logo' />
          </Link>

          <nav className='hidden md:flex gap-8'>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    'font-sans text-body font-bold transition',
                    isActive ? 'border-b-2 border-white pb-1 text-white' : 'text-sage-200 hover:text-white',
                  ].join(' ')
                }>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className='flex items-center gap-3'>
          {appUser ? (
            <>
              {/* Hamburger dropdown */}
              <div className='relative' ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className='flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-sage-200 transition hover:bg-teal-600 hover:text-white'
                  aria-label='Menú'>
                  {menuOpen ? <X size={18} /> : <Menu size={18} />}
                </button>

                {menuOpen && (
                  <div className='absolute right-0 top-12 z-50 w-52 rounded-2xl border border-teal-700/40 bg-teal-800 py-2 shadow-xl shadow-black/20'>
                    {/* Soy turista only on small screens (it's in the top nav on desktop) */}
                    <div className='md:hidden'>
                      <Link
                        to='/'
                        onClick={() => setMenuOpen(false)}
                        className='block px-4 py-2.5 font-sans text-sm font-bold text-sage-200 transition hover:bg-teal-700 hover:text-white'>
                        Soy turista
                      </Link>
                    </div>

                    {/* Mi negocio / Soy prestador — always visible in the dropdown */}
                    <Link
                      to='/my-business'
                      onClick={() => setMenuOpen(false)}
                      className='block px-4 py-2.5 font-sans text-sm font-bold text-sage-200 transition hover:bg-teal-700 hover:text-white'>
                      {business ? 'Mi negocio' : 'Soy prestador'}
                    </Link>

                    <div className='my-1.5 border-t border-teal-700/60' />

                    <Link
                      to='/profile'
                      onClick={() => setMenuOpen(false)}
                      className='block px-4 py-2.5 font-sans text-sm font-bold text-sage-200 transition hover:bg-teal-700 hover:text-white'>
                      Mi Perfil
                    </Link>

                    {canPublish && (
                      <Link
                        to='/create-activity'
                        onClick={() => setMenuOpen(false)}
                        className='block px-4 py-2.5 font-sans text-sm font-bold text-sage-200 transition hover:bg-teal-700 hover:text-white'>
                        Publicar
                      </Link>
                    )}

                    <Link
                      to='/my-bookings'
                      onClick={() => setMenuOpen(false)}
                      className='block px-4 py-2.5 font-sans text-sm font-bold text-sage-200 transition hover:bg-teal-700 hover:text-white'>
                      Mis Reservas
                    </Link>

                    {isSuperUser && (
                      <>
                        <div className='my-1.5 border-t border-teal-700/60' />
                        <Link
                          to='/admin/negocios'
                          onClick={() => setMenuOpen(false)}
                          className='block px-4 py-2.5 font-sans text-sm font-bold text-sage-200 transition hover:bg-teal-700 hover:text-white'>
                          Negocios
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className='flex h-10 w-10 items-center justify-center rounded-xl bg-teal-700 text-sage-200 transition hover:bg-teal-600 hover:text-white'
                title='Cerrar sesión'>
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link
              to='/login'
              className='rounded-xl border border-sage-200 px-5 py-3 font-sans text-sm font-bold text-sage-50 transition hover:bg-teal-700'>
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
