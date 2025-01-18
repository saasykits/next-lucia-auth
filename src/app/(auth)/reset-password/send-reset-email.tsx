"use client";

import { ExclamationTriangleIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmailAction } from "@/lib/auth/actions";
import { Paths } from "@/lib/constants";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

export function SendResetEmail() {
  const [state, sendPasswordResetEmail] = useFormState(sendPasswordResetEmailAction, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      console.log(state.data);
      toast("A password reset link has been sent to your email.");
      router.push(Paths.Login);
      return;
    }
    toast(state?.message ?? "An error occured", {
      icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
    });
  }, [state?.message, state?.success]);

  return (
    <form className="space-y-4" action={sendPasswordResetEmail}>
      <div className="space-y-2">
        <Label>Your Email</Label>
        <Input
          required
          placeholder="email@example.com"
          autoComplete="email"
          defaultValue={state?.input?.email}
          name="email"
          type="email"
        />
      </div>

      <div className="flex flex-wrap justify-between">
        <Link href={Paths.Signup}>
          <Button variant={"link"} size={"sm"} className="p-0">
            Not signed up? Sign up now
          </Button>
        </Link>
      </div>

      <SubmitButton className="w-full">Reset Password</SubmitButton>
      <Button variant="outline" className="w-full" asChild>
        <Link href="/">Cancel</Link>
      </Button>
    </form>
  );
}
