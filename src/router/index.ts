import { createWebHashHistory, createRouter } from "vue-router";

import HomeView from "@/views/HomeView.vue";
import AboutView from "@/views/AboutView.vue";
import Chat_first from "@/views/Chat_first.vue";
import Chat_second from "@/views/Chat_second.vue";

const routes = [
  { path: "/", component: HomeView },
  { path: "/about", component: AboutView },
  { path: "/chat_first", component: Chat_first },
  { path: "/Chat_second", component: Chat_second }
];

const router = createRouter({
  history: createWebHashHistory(),
  routes
});
export default router;
