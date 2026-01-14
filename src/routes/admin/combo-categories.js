import { lazy } from 'react';

const ComboCategoriesRoutes = [
  {
    path: 'combo-categories',
    component: lazy(() => import('views/combo-categories')),
  },
  {
    path: 'combo-categories/add',
    component: lazy(() => import('views/combo-categories/add')),
  },
  {
    path: 'combo-categories/:uuid',
    component: lazy(() => import('views/combo-categories/edit')),
  },
  {
    path: 'combo-categories-clone/:uuid',
    component: lazy(() => import('views/combo-categories/clone')),
  },
  {
    path: 'combo-categories/import',
    component: lazy(() => import('views/combo-categories/import')),
  },
];

export default ComboCategoriesRoutes;
