import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("auth", "routes/auth.tsx"),
  route("criar", "routes/generateLessonPlan.tsx"),
  route("plano/:planId", "routes/lessonPlan.tsx")
] satisfies RouteConfig;
