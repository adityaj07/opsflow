import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight01Icon } from "@hugeicons/core-free-icons";
import type { SignInInput } from "@opsflow/shared";
import { Button } from "@opsflow/ui/components/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@opsflow/ui/components/card";
import { Input } from "@opsflow/ui/components/input";
import { Label } from "@opsflow/ui/components/label";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import { Icon } from "@/components/icon";
import { useLoginMutation } from "@/features/auth/hooks/use-auth-mutations";
import { loginFormSchema } from "@/features/auth/schemas/login-form.schema";
import { getApiErrorMessage } from "@/lib/utils/http";

export function LoginForm() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const form = useForm<SignInInput>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const result = await loginMutation.mutateAsync(values);
      toast.success(`Welcome back, ${result.user.name}`);
      navigate("/app/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  });

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Sign in to OpsFlow</CardTitle>
          <CardDescription>Use your agency credentials to access the internal workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
              {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
              {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
            </div>
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? "Signing in..." : "Continue"}
              <Icon icon={ArrowRight01Icon} className="size-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
