import { postsRoutes } from "./posts";
import { usersRoutes } from "./users";

export const routes = {
  users: usersRoutes,
  posts: postsRoutes,
};

export type AppRoutes = typeof routes;
