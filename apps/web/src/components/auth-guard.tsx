import type * as React from "react";

import type { UserRole } from "@opsflow/shared";
import { Navigate, Outlet, useLocation } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { Loader } from "@/components/loader";
import { useAppStore } from "@/store";

export function AuthGuard({ roles, children }: { roles?: UserRole[]; children?: React.ReactNode }) {
  const location = useLocation();
  const { user, hydrated } = useAppStore(
    useShallow((state) => ({
      user: state.user,
      hydrated: state.hydrated,
    })),
  );

  if (!hydrated) {
    return <Loader />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return children ?? <Outlet />;
}
