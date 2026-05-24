import { NavLink } from 'react-router-dom';
import { PlusCircle as PlusCircleIcon } from 'lucide-react';
import { useAuth } from '../../auth/useAuth';

const navItems = [
  {
    label: 'Explorar',
    to: '/',
    end: true,
  },
  {
    label: 'Dashboard',
    to: '/dashboard',
  },
];

const Header = () => {
  const { appUser } = useAuth();

  console.log(appUser);

  return (
    <header className='h-20 bg-teal-800 text-sage-200'>
      <div className='mx-auto flex h-full max-w-7xl items-center justify-between px-6'>
        <div className='flex items-center gap-10'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white'>
            <img className='h-[80%] w-[80%]' src='/logos/logo_ando.png' alt='Ando logo' />
          </div>

          <nav className='flex gap-8'>
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

        <div className='flex items-center gap-3'>
          <button className='flex items-center gap-2 rounded-xl bg-sage-200 px-5 py-3 font-sans text-sm font-bold text-teal-800 transition hover:bg-sage-100'>
            <PlusCircleIcon size={16} />
            Publicar
          </button>

          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-teal-700 font-sans font-bold text-white'>
            {appUser.email.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
