import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@opsflow/ui/components/button";
import { motion } from "framer-motion";
import { Link, Navigate } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { Icon } from "@/components/icon";
import { useAppStore } from "@/store";

export default function Home() {
  const { user, hydrated } = useAppStore(useShallow((state) => ({ user: state.user, hydrated: state.hydrated })));

  if (hydrated && user) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <main className="relative min-h-[calc(100svh-1px)] overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(120,119,198,0.1),transparent_55%)]" />
      <section className="container mx-auto flex min-h-[calc(100svh-1px)] max-w-4xl flex-col items-center justify-center px-4 text-center">
        <motion.img
          src="/opsflow-logo-light.png"
          alt="OpsFlow"
          className="mb-4 h-16 w-16 rounded-xl object-cover shadow-md dark:hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        />
        <motion.img
          src="/opsflow-logo-dark.png"
          alt="OpsFlow"
          className="mb-4 hidden h-16 w-16 rounded-xl object-cover shadow-md dark:block"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        />
        <motion.h1 className="text-4xl font-semibold tracking-tight" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          OpsFlow
        </motion.h1>
        <p className="mt-3 max-w-xl text-balance text-muted-foreground">
          Internal agency workspace for planning, assignment, and execution.
        </p>
        <Button render={<Link to="/login" />} className="mt-8">
          Sign in
          <Icon icon={ArrowRight01Icon} className="size-4" />
        </Button>
      </section>
    </main>
  );
}
