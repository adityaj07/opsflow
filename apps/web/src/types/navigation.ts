import type { UserRole } from "@opsflow/shared";

export type SidebarItem = {
  title: string;
  url: string;
  roles: UserRole[];
  icon: React.ReactNode;
};
