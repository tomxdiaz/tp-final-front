import { createBrowserRouter } from 'react-router-dom';
import HomePage from '../pages/HomePage';
import Layout from '../components/Layout/Layout';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <div>esta es la pagina informativa</div>,
      },
      {
        path: '/ando_desafio_capri',
        element: <HomePage />,
      },
    ],
  },
]);
