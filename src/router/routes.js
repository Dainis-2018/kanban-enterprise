// Layout component
import MainLayout from '../components/layout/MainLayout.vue'

// Define routes
const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: 'Projects Hub' }
      },
//      {
//        path: 'favorites',
//        name: 'Favorites',
//        component: () => import('../views/Favorites.vue'),
//        meta: { title: 'Favorite Projects' }
//      },
      {
        path: 'teams',
        name: 'Teams',
        component: () => import('../views/Teams.vue'),
        meta: { title: 'Teams' }
      },
//      {
//        path: 'reports',
//        name: 'Reports',
//        component: () => import('../views/Reports.vue'),
//        meta: { title: 'Reports' }
//      },
      {
        path: 'projects/:id',
        component: () => import('../views/ProjectContainer.vue'),
        children: [
          {
            path: '',
            name: 'KanbanView',
            component: () => import('../views/KanbanView.vue'),
            meta: { title: 'Kanban Board' }
          },
          {
            path: 'roadmap',
            name: 'RoadmapView',
            component: () => import('../views/RoadmapView.vue'),
            meta: { title: 'Roadmap' }
          },
//          {
//            path: 'reports',
//            name: 'ProjectReports',
//            component: () => import('../views/ProjectReports.vue'),
//            meta: { title: 'Project Reports' }
//          },
          {
            path: 'settings',
            name: 'ProjectSettings',
            component: () => import('../views/ProjectSettings.vue'),
            meta: { title: 'Project Settings' }
          }
        ]
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

export default routes