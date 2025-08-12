import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../components/Layout/AppLayout';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TasksPage } from '../pages/TasksPage';
import { ProjectsPage } from '../pages/ProjectsPage';
import { TeamPage } from '../pages/TeamPage';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'tasks',
        element: <TasksPage />
      },
      {
        path: 'projects',
        element: <ProjectsPage />
      },
      {
        path: 'team',
        element: <TeamPage />
      }
    ]
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />
  }
]);
