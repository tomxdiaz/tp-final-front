import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';
import { GlobalRole } from '../../types/types';

const RequireSuperUser = () => {
  const { appUser, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading && !isAuthenticated) {
    return (
      <div className='flex min-h-screen items-center justify-center bg-sage-50'>
        <div className='h-12 w-12 animate-spin rounded-full border-4 border-sage-100 border-t-teal-700' />
      </div>
    );
  }

  if (!loading && (!isAuthenticated || appUser?.global_role !== GlobalRole.SUPER_USER)) {
    return <Navigate to='/' replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default RequireSuperUser;
