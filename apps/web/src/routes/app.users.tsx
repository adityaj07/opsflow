import { Navigate } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { useAppStore } from "@/store";

export default function UsersRoute() {
  const { user } = useAppStore(useShallow((state) => ({ user: state.user })));

  if (user?.role !== "ADMIN") {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <section className="space-y-2">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <p className="text-muted-foreground">Only admins can access this area.</p>
    </section>
  );
}
