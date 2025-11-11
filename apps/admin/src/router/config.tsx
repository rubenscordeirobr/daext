import type { RouteObject } from 'react-router-dom';
import LoginPage from '../pages/auth/login/page';
import ForgotPasswordPage from '../pages/auth/forgot-password/page';
import VerifyCodePage from '../pages/auth/verify-code/page';
import ResetPasswordPage from '../pages/auth/reset-password/page';
import DashboardPage from '../pages/dashboard/page';
import ProfilePage from '../pages/profile/page';
import UsersPage from '../pages/users/page';
import ProfessorsPage from '../pages/professors/page';
import ResearchPage from '../pages/research/page';
import NewsPage from '../pages/news/page';
import NotFoundPage from '../pages/NotFound';
import AuthGuard from '../components/AuthGuard';

const routes: RouteObject[] = [
    {
        path: '/',
        element: <LoginPage />,
    },
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },
    {
        path: '/verify-code',
        element: <VerifyCodePage />,
    },
    {
        path: '/reset-password',
        element: <ResetPasswordPage />,
    },
    {
        path: '/dashboard',
        element: (
            <AuthGuard>
                <DashboardPage />
            </AuthGuard>
        ),
    },
    {
        path: '/profile',
        element: (
            <AuthGuard>
                <ProfilePage />
            </AuthGuard>
        ),
    },
    {
        path: '/users',
        element: (
            <AuthGuard>
                <UsersPage />
            </AuthGuard>
        ),
    },
    {
        path: '/professors',
        element: (
            <AuthGuard>
                <ProfessorsPage />
            </AuthGuard>
        ),
    },
    {
        path: '/research',
        element: (
            <AuthGuard>
                <ResearchPage />
            </AuthGuard>
        ),
    },
    {
        path: '/news',
        element: (
            <AuthGuard>
                <NewsPage />
            </AuthGuard>
        ),
    },
    {
        path: '*',
        element: <NotFoundPage />,
    },
];

export default routes;
