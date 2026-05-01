import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@opsflow/ui/components/breadcrumb";
import { Separator } from "@opsflow/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@opsflow/ui/components/sidebar";
import { Outlet, useLocation } from "react-router";
import { useShallow } from "zustand/react/shallow";

import { AuthGuard } from "@/components/auth-guard";
import { ModeToggle } from "@/components/mode-toggle";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { useAppStore } from "@/store";

function AppLayout() {
  const location = useLocation();
  const { user } = useAppStore(useShallow((state) => ({ user: state.user })));

  if (!user) {
    return null;
  }

  const getBreadcrumbLabel = () => {
    if (location.pathname === "/app/dashboard") return "Dashboard";
    if (location.pathname === "/app/tasks") return "Tasks";
    if (location.pathname.startsWith("/app/tasks/")) return "Task Detail";
    if (location.pathname === "/app/users") return "Users";
    return "OpsFlow";
  };

  const activePage = getBreadcrumbLabel();

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/70 px-4 backdrop-blur">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>{activePage}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col p-4 md:p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppRoute() {
  return (
    <AuthGuard>
      <AppLayout />
    </AuthGuard>
  );
}
