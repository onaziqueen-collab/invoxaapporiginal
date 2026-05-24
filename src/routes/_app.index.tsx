import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/_app/")({
  component: Index,
});

function Index() {
  const { state } = useStore();
  return <Navigate to={state.user ? "/dashboard" : "/login"} replace />;
}
