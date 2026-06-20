import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import RequireAuth from '../components/Auth/RequireAuth';
import HomePage from '../pages/HomePage';
import ComingSoonPage from '../pages/ComingSoonPage';
import LoginPage from '../pages/LoginPage';
import ProfilePage from '../pages/ProfilePage';
import Register from '../components/Auth/Register';
import CreateBusinessPage from '../pages/CreateBusinessPage';
import CreateActivityPage from '../pages/CreateActivityPage';
import ActivityDetailPage from '../pages/ActivityDetailPage';
import BusinessDetailPage from '../pages/BusinessDetailPage';
import BookingPage from '../pages/BookingPage';
import MyBusinessPage from '../pages/MyBusinessPage';
import MyBookingsPage from '../pages/MyBookingsPage';
import BookingDetailPage from '../pages/BookingDetailPage';
import UpdateActivityPage from '../pages/UpdateActivityPage';
import AdminNegociosPage from '../pages/AdminNegociosPage';
import RequireSuperUser from '../components/Auth/RequireSuperUser';
import SessionDetailPage from '../pages/SessionDetailPage';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Public routes
      { path: '/', element: <HomePage /> },
      { path: '/ando_desafio_capri', element: <ComingSoonPage /> },
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <Register /> },
      { path: '/activity/:id', element: <ActivityDetailPage /> },
      { path: '/business/:id', element: <BusinessDetailPage /> },

      // Protected routes
      {
        element: <RequireAuth />,
        children: [
          { path: '/profile', element: <ProfilePage /> },
          { path: '/my-business', element: <MyBusinessPage /> },
          { path: '/create-business', element: <CreateBusinessPage /> },
          { path: '/create-activity', element: <CreateActivityPage /> },
          { path: '/update-activity/:id', element: <UpdateActivityPage /> },
          { path: '/booking/:id', element: <BookingPage /> },
          { path: '/my-bookings', element: <MyBookingsPage /> },
          { path: '/my-bookings/:id', element: <BookingDetailPage /> },
          { path: '/activity/:id/session/:sessionId', element: <SessionDetailPage /> },
        ],
      },
      {
        element: <RequireSuperUser />,
        children: [{ path: '/admin/negocios', element: <AdminNegociosPage /> }],
      },
      {
        path: '/login',
        element: <LoginPage />,
      },
      {
        path: '/register',
        element: <Register />,
      },
    ],
  },
]);
