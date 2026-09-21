import type { Route } from "./+types/home"
import { Link, Outlet } from "react-router"

export function meta({}: Route.MetaArgs) {
  return [
    { title: "BelialDaniel" },
    { name: "description", content: "Welcome to my profile!" },
  ];
}

export default function Layout() {
  return (
    <>
    <header> 
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
    </header>
    <main>
      <Outlet />
    </main>
    </>
  )
}
