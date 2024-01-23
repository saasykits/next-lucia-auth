"use client";

import Link from "next/link";
import { PasswordInput } from "@/components/password-input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/loading-button";
import { DiscordLogoIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/auth/actions";
import { useFormState, useFormStatus } from "react-dom";

export function Signup() {
  const [state, formAction] = useFormState(signup, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{APP_TITLE} Sign Up</CardTitle>
        <CardDescription>Sign up to start using the app</CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full" asChild>
          <Link href="/login/discord">
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
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              className={state?.fieldError?.email ? "border-destructive" : ""}
              placeholder="email@example.com"
              autoComplete="email"
              name="email"
              type="email"
            />
            {state?.fieldError?.email ? (
              <p className="text-[0.8rem] font-medium text-destructive">
                {state.fieldError.email}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <PasswordInput
              className={
                state?.fieldError?.password ? "border-destructive" : ""
              }
              name="password"
              autoComplete="current-password"
              placeholder="********"
            />
            {state?.fieldError?.password ? (
              <p className="text-[0.8rem] font-medium text-destructive">
                {state.fieldError.password}
              </p>
            ) : null}
          </div>
          {state?.formError ? (
            <p className="text-[0.8rem] font-medium text-destructive">
              {state.formError}
            </p>
          ) : null}
          <div>
            <Link href={"/login"}>
              <Button variant={"link"} size={"sm"} className="p-0">
                Already signed up? Login instead.
              </Button>
            </Link>
          </div>

          <Submit />
          <Button variant="outline" className="w-full" asChild>
            <Link href="/">Cancel</Link>
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

const Submit = () => {
  const { pending } = useFormStatus();
  return (
    <LoadingButton className="w-full" loading={pending}>
      Sign Up
    </LoadingButton>
  );
};
