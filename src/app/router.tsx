import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage';
import ComingSoonPage from '../pages/ComingSoonPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: '/ando_desafio_capri',
        element: <ComingSoonPage />,
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <div>Register here</div>,
      },

      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
    ],
  },
]);
