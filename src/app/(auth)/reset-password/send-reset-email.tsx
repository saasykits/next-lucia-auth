"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { sendPasswordResetLink } from "@/lib/auth/actions";
import { ExclamationTriangleIcon } from "@/components/icons";
import { Paths } from "@/lib/constants";

export function SendResetEmail() {
  const [state, formAction] = useFormState(sendPasswordResetLink, null);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      toast("A password reset link has been sent to your email.");
      router.push(Paths.Login);
    }
    if (state?.error) {
      toast(state.error, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [state?.error, state?.success]);

  return (
    <form className="space-y-4" action={formAction}>
      <div className="space-y-2">
        <Label>Your Email</Label>
        <Input
          required
          placeholder="email@example.com"
          autoComplete="email"
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
