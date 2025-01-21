"use client";

import { ExclamationTriangleIcon } from "@/components/icons";
import { PasswordInput } from "@/components/password-input";
import { SubmitButton } from "@/components/submit-button";
import { Label } from "@/components/ui/label";
import { resetPasswordAction } from "@/lib/auth/actions";
import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

export function ResetPassword({ token }: { token: string }) {
  const [state, formAction] = useFormState(resetPasswordAction, null);

  useEffect(() => {
    if (state?.success === false) {
      toast(state?.message, {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [state?.success, state?.message]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div className="space-y-2">
        <Label>New Password</Label>
        <PasswordInput
          name="password"
          required
          autoComplete="new-password"
          defaultValue={state?.input?.password}
          placeholder="********"
        />
      </div>
      <SubmitButton className="w-full">Reset Password</SubmitButton>
    </form>
  );
}
