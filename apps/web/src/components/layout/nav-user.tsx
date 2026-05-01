import { ArrowRight01Icon, Logout02Icon, UserIcon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
} from "@opsflow/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@opsflow/ui/components/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@opsflow/ui/components/alert-dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@opsflow/ui/components/sidebar";

import { Icon } from "@/components/icon";
import { useLogoutMutation } from "@/features/auth/hooks/use-auth-mutations";
import { getApiErrorMessage } from "@/lib/utils/http";
import { useAppStore } from "@/store";

export function NavUser({ user }: { user: { name: string; email: string } }) {
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const navigate = useNavigate();
  const logoutMutation = useLogoutMutation();
  const { clearAuth } = useAppStore(useShallow((state) => ({ clearAuth: state.clearAuth })));

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const onLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setIsLogoutDialogOpen(false);
      clearAuth();
      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
          <DropdownMenuTrigger render={<SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />}>
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
            <Icon icon={ArrowRight01Icon} className="ml-auto size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-56 rounded-lg" align="end" sideOffset={8}>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex items-center gap-2 text-sm">
                  <Icon icon={UserIcon} className="size-4" />
                  <span>{user.email}</span>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <AlertDialogTrigger
              render={<DropdownMenuItem />}
              onClick={() => setIsLogoutDialogOpen(true)}
            >
                <Icon icon={Logout02Icon} className="size-4" />
                Log out
            </AlertDialogTrigger>
          </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Log out from OpsFlow?</AlertDialogTitle>
          <AlertDialogDescription>
            You will need to log in again to access your workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onLogout} disabled={logoutMutation.isPending}>
            <motion.span initial={{ opacity: 0.7 }} animate={{ opacity: 1 }}>
              {logoutMutation.isPending ? "Logging out..." : "Log out"}
            </motion.span>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
