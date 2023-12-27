"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

import { LoadingButton } from "@/components/loading-button";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@/components/icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@/lib/validators/auth";
import { PasswordInput } from "@/components/password-input";

export function ResetPassword({ token }: { token: string }) {
  const router = useRouter();
  const resetPass = useMutation(
    ["reset-password"],
    async (input: ResetPasswordInput) => {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as Record<string, string>;
      if (!res.ok) {
        throw new Error(data.error ?? "Invalid data");
      }
      return data;
    },
    {
      onSuccess: () => {
        toast("Successful", {
          description: "Password reset successful.",
        });
        router.push("/login");
      },
      onError: (err: Error) => {
        toast("Operation failed", {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
          description: err.message,
        });
      },
    },
  );
  const form = useForm<ResetPasswordInput>({
    defaultValues: { password: "", token },
    resolver: zodResolver(resetPasswordSchema),
  });
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Enter your email to get reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => resetPass.mutate(data))}
            className="grid gap-4"
          >
            <input type="hidden" {...form.register("token")} />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LoadingButton loading={resetPass.isLoading} className="w-full">
              Reset Password
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
