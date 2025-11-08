import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/home/page'));
const ProfessorsPage = lazy(() => import('../pages/professors/page'));
const ResearchPage = lazy(() => import('../pages/research-projects/page'));
const NewsPage = lazy(() => import('../pages/news/page'));
const ContactPage = lazy(() => import('../pages/contact/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
    {
        path: '/',
        element: <HomePage />,
    },
    {
        path: '/professors',
        element: <ProfessorsPage />,
    },
    {
        path: '/research-projects',
        element: <ResearchPage />,
    },
    {
        path: '/news',
        element: <NewsPage />,
    },
    {
        path: '/contact',
        element: <ContactPage />,
    },
    {
        path: '*',
        element: <NotFound />,
    },
];

export default routes;
