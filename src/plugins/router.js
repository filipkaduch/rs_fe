import Vue from 'vue';
import Router from 'vue-router';
import HelloWorld from '../components/HelloWorld.vue';


Vue.use(Router);

const routes = [
  {
    path: '/',
    name: 'home',
    component: HelloWorld,
    params: true
  }
];

const router = new Router({
  routes
});

export default router;
