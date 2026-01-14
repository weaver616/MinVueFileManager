import { RouteRecordNormalized, RouteRecordRaw } from "vue-router";

const viewsList = import.meta.glob('@/views/**/*.vue', {import: 'default', eager: true})
// const views = require.context('../views', true, /\/.*\.vue$/);
const dynamicRoutes: Array<RouteRecordRaw> = [];
// 遍历文件名字
Object.keys(viewsList).forEach((key) => {
  const statIndex = key.indexOf('/', 5);
  const endIndex = key.lastIndexOf('/');
  const name = key.substring(statIndex + 1, endIndex);
  let route: any = {};
  const appName = import.meta.env.VITE_APP_NAME;
  if (appName && name !== '404' && name !== 'dashboard') {
    route = {
      name: name,
      path: `/${name}`,
      component: () => import(`@/views/${name}/${name}.vue`) //懒加载的！
    };
    dynamicRoutes.push(route);
  }
});

const basicRoutes: Array<RouteRecordRaw> = [
  // 手动注册 SimpleFileOperations 页面（文件在 views 根目录）
  {
    name: 'SimpleFileOperations',
    path: '/SimpleFileOperations',
    alias: ['/SIMPLEFILEOPERATION', '/simplefileoperation', '/simplefileoperations'],
    props: (route) => ({
      initialPath: typeof route.query.path === 'string' ? route.query.path : '',
      embedded: false
    }),
    component: () => import('@/views/SIMPLEFILEOPERATION/SimpleFileOperations.vue')
  },
  // 显式支持全大写路径，避免外部系统大小写差异导致 404
  {
    name: 'SimpleFileOperationsUpper',
    path: '/SIMPLEFILEOPERATION',
    props: (route) => ({
      initialPath: typeof route.query.path === 'string' ? route.query.path : '',
      embedded: false
    }),
    component: () => import('@/views/SIMPLEFILEOPERATION/SimpleFileOperations.vue')
  },
  {
    name: 'not-found',
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404/index.vue')
  }
];


const routes = dynamicRoutes.concat(basicRoutes);
export default routes;


