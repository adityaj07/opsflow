import { zodResolver } from "@hookform/resolvers/zod";
import { Add01Icon } from "@hugeicons/core-free-icons";
import type { CreateUserInput, UserRole } from "@opsflow/shared";
import { Button } from "@opsflow/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@opsflow/ui/components/dialog";
import { Input } from "@opsflow/ui/components/input";
import { Label } from "@opsflow/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@opsflow/ui/components/select";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Icon } from "@/components/icon";
import { useCreateUserMutation } from "@/features/users/hooks/use-users";
import { inviteUserFormSchema } from "@/features/users/schemas/invite-user-form.schema";
import { getApiErrorMessage } from "@/lib/utils/http";

const roles: UserRole[] = ["USER", "MANAGER", "ADMIN"];

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const createUserMutation = useCreateUserMutation();
  const form = useForm<CreateUserInput>({
    resolver: zodResolver(inviteUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "USER",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await createUserMutation.mutateAsync(values);
      toast.success("User invited successfully.");
      form.reset({ name: "", email: "", password: "", role: "USER" });
      setOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Icon icon={Add01Icon} className="size-4" />
        Invite a user
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a user</DialogTitle>
          <DialogDescription>Create a new account and assign a role.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="invite-name">Name</Label>
            <Input id="invite-name" {...form.register("name")} />
            {form.formState.errors.name ? (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-email">Email</Label>
            <Input id="invite-email" type="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-password">Temporary Password</Label>
            <Input id="invite-password" type="password" {...form.register("password")} />
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role">Role</Label>
            <Controller
              control={form.control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="invite-role" className="w-full">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.role ? (
              <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createUserMutation.isPending}>
              {createUserMutation.isPending ? "Inviting..." : "Send Invite"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
