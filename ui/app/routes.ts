import { type RouteConfig, index, layout, route } from "@react-router/dev/routes"

export default [
  layout("routes/Layout.tsx", [
    index("routes/Home.tsx"),
    route("experience", "routes/Experience.tsx"),
    route("projects", "routes/Projects.tsx"),
    route("contact", "routes/Contact.tsx"),
    route("ship", "routes/ShipLab.tsx"),
  ]),
] satisfies RouteConfig
