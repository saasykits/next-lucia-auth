"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordInput } from "@/components/password-input";
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
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/loading-button";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ExclamationTriangleIcon } from "@/components/icons";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

import { registerSchema, type RegisterInput } from "@/lib/validators/auth";

export function Register() {
  const router = useRouter();
  const register = useMutation(
    ["register"],
    async (input: RegisterInput) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });
      const data = (await res.json()) as Record<string, string>;

      if (!res.ok) {
        throw new Error(data.error ?? "Invalid register");
      }
      return data;
    },
    {
      onSuccess: () => {
        toast("Successfully signed up", {
          description: "Please verify your email",
        });
        router.push("/verify-email");
      },
      onError: (err: Error) => {
        toast("Registration failed", {
          icon: (
            <ExclamationTriangleIcon className="h-4 w-4 text-destructive" />
          ),
          description: err.message,
        });
      },
    },
  );
  const form = useForm<RegisterInput>({
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
    resolver: zodResolver(registerSchema),
  });
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Enter your information below to sign up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => register.mutate(data))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="example@email.com"
                      type="email"
                      {...field}
                    />
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

            <div>
              <Link href={"/login"}>
                <Button variant={"link"} size={"sm"} className="p-0">
                  Already signed up? Login instead.
                </Button>
              </Link>
            </div>
            <div>
              <LoadingButton loading={register.isLoading} className="w-full">
                Sign up
              </LoadingButton>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
