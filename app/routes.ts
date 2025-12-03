import { type RouteConfig, index, route } from "@react-router/dev/routes";
import { Route } from "react-router";

export default [
    index("routes/home.tsx"),
    route("/login", "routes/login.tsx"),
    route("/dashboard", "routes/dashboard.tsx"),
] satisfies RouteConfig;
