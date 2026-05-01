import { Navigate } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { LoginForm } from "@/features/auth/components/login-form";
import { useAppStore } from "@/store";

export default function LoginRoute() {
  const { user, hydrated } = useAppStore(useShallow((state) => ({ user: state.user, hydrated: state.hydrated })));

  if (hydrated && user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <main className="relative min-h-[calc(100svh-1px)] overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,197,94,0.08),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,0.08),transparent_45%)]" />
      <div className="container relative mx-auto flex min-h-[calc(100svh-1px)] max-w-5xl items-center justify-center px-4 py-12">
        <div className="grid w-full items-center gap-10 md:grid-cols-2">
          <section className="space-y-3">
            <img src="/opsflow-logo-light.png" alt="OpsFlow" className="h-14 w-14 rounded-lg object-cover dark:hidden" />
            <img src="/opsflow-logo-dark.png" alt="OpsFlow" className="hidden h-14 w-14 rounded-lg object-cover dark:block" />
            <h1 className="text-3xl font-semibold tracking-tight">Welcome to OpsFlow</h1>
            <p className="text-muted-foreground">Securely sign in to continue to your role-based workspace.</p>
          </section>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
