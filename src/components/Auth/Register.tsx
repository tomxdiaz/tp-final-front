import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

export default function Register() {
  const { signUp, session, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!loading && session) {
    return <Navigate to='/profile' replace />;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');
    setFormLoading(true);

    try {
      await signUp(email, password);

      setSuccessMessage('Cuenta creada correctamente. Ya podés iniciar sesión.');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1200);
    } catch (error) {
      setErrorMessage(error.data?.message || 'Error al crear la cuenta');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <main className='flex min-h-screen items-center justify-center bg-sage-50 px-6'>
      <form onSubmit={handleSubmit} className='w-full max-w-md rounded-2xl bg-white p-8 shadow-xl'>
        <h1 className='mb-6 font-display text-[3rem] uppercase leading-none text-teal-900'>Crear cuenta</h1>

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
            autoComplete='new-password'
            minLength={6}
            required
          />
        </label>

        {errorMessage && <p className='mt-4 rounded-xl bg-earth-50 px-4 py-3 font-sans text-sm font-bold text-earth-900'>{errorMessage}</p>}

        {successMessage && (
          <p className='mt-4 rounded-xl bg-sage-50 px-4 py-3 font-sans text-sm font-bold text-sage-900'>{successMessage}</p>
        )}

        <button
          type='submit'
          disabled={formLoading}
          className='mt-6 w-full rounded-xl bg-teal-800 px-5 py-3 font-sans text-body font-bold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60'>
          {formLoading ? 'Creando cuenta...' : 'Crear cuenta'}
        </button>

        <p className='mt-5 text-center font-sans text-sm text-sage-800'>
          ¿Ya tenés cuenta?{' '}
          <Link to='/login' className='font-bold text-teal-800 hover:text-teal-700'>
            Iniciar sesión
          </Link>
        </p>
      </form>
    </main>
  );
}
