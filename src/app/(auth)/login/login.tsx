"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { PasswordInput } from "@/components/password-input";
import { loginSchema, type LoginInput } from "@/lib/validators/auth";
import { ExclamationTriangleIcon } from "@/components/icons";

export function Login() {
  const router = useRouter();
  const login = useMutation(
    ["login"],
    async (input: LoginInput) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as Record<string, string>;
      if (!res.ok) {
        throw new Error(data.error ?? "Invalid login");
      }
      return data;
    },
    {
      onSuccess: () => {
        toast("Login successful");
        router.push("/");
      },
      onError: (err: Error) => {
        toast("Login failed", {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
          description: err.message,
        });
      },
    },
  );
  const form = useForm<LoginInput>({
    defaultValues: {
      email: "",
      password: "",
    },
    resolver: zodResolver(loginSchema),
  });
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>Log In</CardTitle>
        <CardDescription>
          Enter your username and password to login.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => login.mutate(data))}
            className="grid gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            <div className="flex flex-wrap justify-between">
              <Link href={"/signup"}>
                <Button variant={"link"} size={"sm"} className="p-0">
                  Not signed up? Sign up now.
                </Button>
              </Link>
              <Link href={"/reset-password"}>
                <Button variant={"link"} size={"sm"} className="p-0">
                  Forgot password?
                </Button>
              </Link>
            </div>

            <LoadingButton loading={login.isLoading} className="w-full">
              Log In
            </LoadingButton>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
