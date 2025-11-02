
import { RouteObject } from 'react-router-dom';
import { lazy } from 'react';

const HomePage = lazy(() => import('../pages/home/page'));
const DocentesPage = lazy(() => import('../pages/docentes/page'));
const PesquisasPage = lazy(() => import('../pages/pesquisas/page'));
const NoticiasPage = lazy(() => import('../pages/noticias/page'));
const ContatoPage = lazy(() => import('../pages/contato/page'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/docentes',
    element: <DocentesPage />,
  },
  {
    path: '/pesquisas',
    element: <PesquisasPage />,
  },
  {
    path: '/noticias',
    element: <NoticiasPage />,
  },
  {
    path: '/contato',
    element: <ContatoPage />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
