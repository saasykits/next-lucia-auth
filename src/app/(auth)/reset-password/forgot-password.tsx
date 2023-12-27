"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@/components/icons";
import { LoadingButton } from "@/components/loading-button";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/lib/validators/auth";

export function ForgotPassword() {
  const forgotPass = useMutation(
    ["forgot-password"],
    async (input: ForgotPasswordInput) => {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as Record<string, string>;
      if (!res.ok) {
        throw new Error(data.error ?? "Invalid Email");
      }
      return data;
    },
    {
      onSuccess: () => {
        toast("Reset link sent", {
          description: "Check your email for the reset link.",
        });
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
  const form = useForm<ForgotPasswordInput>({
    defaultValues: { email: "" },
    resolver: zodResolver(forgotPasswordSchema),
  });
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Enter your email to get reset link.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => forgotPass.mutate(data))}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="example@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-wrap justify-between">
              <Link href={"/signup"}>
                <Button variant={"link"} size={"sm"} className="p-0">
                  Not signed up? Sign up now
                </Button>
              </Link>
            </div>

            <LoadingButton loading={forgotPass.isLoading} className="w-full">
              Send password reset email
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
