import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export default function Login() {
  const { signIn, session, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setFormLoading(true);

    try {
      await signIn(email, password);
      navigate(from, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo iniciar sesión';

      setErrorMessage(message);
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-sage-50 px-6'>
      <form onSubmit={handleSubmit} className='w-full max-w-md rounded-2xl bg-white p-8 shadow-xl'>
        <h1 className='mb-6 font-display text-[3rem] uppercase leading-none text-teal-900'>Iniciar sesión</h1>

        <label className='mb-4 block'>
          <span className='mb-1 block font-sans text-sm font-bold text-sage-800'>Email</span>

          <input
            type='email'
            className='h-12 w-full rounded-xl border border-sage-100 px-4 font-sans text-body outline-none focus:border-teal-700'
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete='email'
            required
          />
        </label>

        <label className='block'>
          <span className='mb-1 block font-sans text-sm font-bold text-sage-800'>Password</span>

          <input
            type='password'
            className='h-12 w-full rounded-xl border border-sage-100 px-4 font-sans text-body outline-none focus:border-teal-700'
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete='current-password'
            required
          />
        </label>

        {errorMessage && <p className='mt-4 rounded-xl bg-earth-50 px-4 py-3 font-sans text-sm font-bold text-earth-900'>{errorMessage}</p>}

        <button
          type='submit'
          disabled={formLoading}
          className='mt-6 w-full rounded-xl bg-teal-800 px-5 py-3 font-sans text-body font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60'>
          {formLoading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </main>
  );
}
