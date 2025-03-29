import { Suspense, lazy } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { NavBar } from "../components/NavBar";

export const Route = createRootRoute({
  component: () => (
    <>
      <NavBar />
      <main className="min-h-screen bg-gray-50">
        <Outlet />
      </main>
      <Suspense>
        <TanStackRouterDevtools />
      </Suspense>
    </>
  ),
});

const TanStackRouterDevtools =
  process.env.NODE_ENV === "production"
    ? () => null // Render nothing in production
    : lazy(() =>
        // Lazy load in development
        import("@tanstack/router-devtools").then((res) => ({
          default: res.TanStackRouterDevtools,
          // For Embedded Mode
          // default: res.TanStackRouterDevtoolsPanel
        })),
      );
