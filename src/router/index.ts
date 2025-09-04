import { createWebHashHistory, createRouter } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import Chart from "@/views/Chart.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/about", component: AboutView },
  { path: "/chart", component: Chart }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
export default router;
