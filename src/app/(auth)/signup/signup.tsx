"use client";

import { DiscordLogoIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import TextInput from "@/components/text-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signupAction } from "@/lib/auth/actions";
import { APP_TITLE } from "@/lib/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useActionState } from "react";

export function Signup() {
  const [state, formAction] = useActionState(signupAction, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Sign Up</CardTitle>
        <CardDescription>Sign up to start using the app</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login/discord" prefetch={false}>
            <DiscordLogoIcon className="mr-2 h-5 w-5" />
            Sign up with Discord
          </Link>
        </Button>
        <div className="my-2 flex items-center">
          <div className="flex-grow border-t border-muted" />
          <div className="mx-2 text-muted-foreground">or</div>
          <div className="flex-grow border-t border-muted" />
        </div>

        <form action={formAction} className="space-y-4">
          <TextInput
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={state?.input?.email}
            placeholder="email@example.com"
            error={!!state?.errors?.fieldErrors.email}
            helperText={state?.errors?.fieldErrors.email?.[0]}
          />
          <TextInput
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            defaultValue={state?.input?.password}
            placeholder="********"
            minLength={8}
            error={!!state?.errors?.fieldErrors.password}
            helperText={state?.errors?.fieldErrors.password?.[0]}
          />

          {state?.message ? (
            <p
              className={cn(
                "rounded-lg border p-2 text-[0.8rem] font-medium",
                state?.success
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {state?.message}
            </p>
          ) : null}
          <div>
            <Link href={"/login"}>
              <span className="p-0 text-xs font-medium underline-offset-4 hover:underline">
                Already signed up? Login instead.
              </span>
            </Link>
          </div>

          <SubmitButton className="w-full" aria-label="submit-btn">
            Sign Up
          </SubmitButton>
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
