import type * as React from "react";

import { DashboardSquare02Icon, Task01Icon, UserGroupIcon } from "@hugeicons/core-free-icons";
import type { AuthUser } from "@opsflow/shared";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@opsflow/ui/components/sidebar";
import { Link } from "react-router";

import { Icon } from "@/components/icon";
import { NavMain } from "@/components/layout/nav-main";
import { NavUser } from "@/components/layout/nav-user";
import type { SidebarItem } from "@/types/navigation";

const getNavItems = (role: AuthUser["role"]): SidebarItem[] => [
  {
    title: "Dashboard",
    url: "/app/dashboard",
    icon: <Icon icon={DashboardSquare02Icon} />,
    roles: ["USER", "MANAGER", "ADMIN"],
  },
  {
    title: role === "USER" ? "My Tasks" : "Tasks",
    url: "/app/tasks",
    icon: <Icon icon={Task01Icon} />,
    roles: ["USER", "MANAGER", "ADMIN"],
  },
  {
    title: "Users",
    url: "/app/users",
    icon: <Icon icon={UserGroupIcon} />,
    roles: ["ADMIN"],
  },
];

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: AuthUser }) {
  const allowedItems = getNavItems(user.role).filter((item) => item.roles.includes(user.role));

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/app/dashboard" />}>
              <img
                src="/opsflow-logo-light.png"
                alt="OpsFlow"
                className="size-8 rounded-md object-cover dark:hidden"
              />
              <img
                src="/opsflow-logo-dark.png"
                alt="OpsFlow"
                className="hidden size-8 rounded-md object-cover dark:block"
              />
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">OpsFlow</span>
                <span className="truncate text-xs text-muted-foreground">Agency Workspace</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={allowedItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  );
}
