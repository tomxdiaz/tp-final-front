import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage';
import ComingSoonPage from '../pages/ComingSoonPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import Register from '../components/Auth/Register';
import ActivityDetailPage from '../pages/ActivityDetailPage';

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
        element: <Register />,
      },
      {
        path: '/dashboard',
        element: <DashboardPage />,
      },
      {
        path: '/activity/:id',
        element: <ActivityDetailPage />,
      },
    ],
  },
]);
