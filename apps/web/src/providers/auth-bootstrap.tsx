import type * as React from "react";
import { useEffect } from "react";

import { Loader } from "@/components/loader";
import { useMeQuery } from "@/features/auth/hooks/use-me-query";
import { useAppStore } from "@/store";

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const { setUser, setHydrated, hydrated } = useAppStore();
  const meQuery = useMeQuery();

  useEffect(() => {
    if (meQuery.isSuccess) {
      setUser(meQuery.data.user);
      setHydrated(true);
      return;
    }

    if (meQuery.isError) {
      setUser(null);
      setHydrated(true);
    }
  }, [meQuery.isSuccess, meQuery.isError, meQuery.data, setHydrated, setUser]);

  if (!hydrated && meQuery.isLoading) {
    return <Loader />;
  }

  return children;
}
