import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage';
import ComingSoonPage from '../pages/ComingSoonPage';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import Register from '../components/Auth/Register';
import CreateBusinessPage from '../pages/CreateBusinessPage';
import CreateActivityPage from '../pages/CreateActivityPage';

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
        path: '/create-business',
        element: <CreateBusinessPage />,
      },
      {
        path: '/create-activity',
        element: <CreateActivityPage />,
      },
    ],
  },
]);
