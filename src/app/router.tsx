import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import HomePage from '../pages/HomePage';
import ComingSoonPage from '../pages/ComingSoonPage';

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
    ],
  },
]);
