import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { EmptyState } from '@/shared/ui';
import { Layout } from './layout';

const DebtorsPage = lazy(() => import('@/pages/debtors').then((m) => ({ default: m.DebtorsPage })));
const StudentsPage = lazy(() =>
  import('@/pages/students').then((m) => ({ default: m.StudentsPage })),
);
const StudentDetailsPage = lazy(() =>
  import('@/pages/student-details').then((m) => ({ default: m.StudentDetailsPage })),
);

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <DebtorsPage /> },
      { path: '/students', element: <StudentsPage /> },
      { path: '/students/:id', element: <StudentDetailsPage /> },
      { path: '*', element: <EmptyState title="Страница не найдена" /> },
    ],
  },
]);
