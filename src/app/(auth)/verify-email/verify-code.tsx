"use client";
import { ExclamationTriangleIcon } from "@/components/icons";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import {
  logoutAction,
  resendVerificationEmail as resendEmail,
  verifyEmailAction,
} from "@/lib/auth/actions";
import { Label } from "@radix-ui/react-label";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const VerifyCode = () => {
  const [verifyEmailState, verifyEmail] = useActionState(verifyEmailAction, null);
  const [resendState, resendAction] = useActionState(resendEmail, null);
  const [_, logout] = useActionState(logoutAction, null);
  const codeFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (resendState?.success === false) {
      toast(resendState?.message ?? "An error occured", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    } else if (resendState?.success) {
      toast("Email sent!");
    }
  }, [resendState?.message, resendState?.success]);

  useEffect(() => {
    if (verifyEmailState?.success === false) {
      toast(verifyEmailState?.message ?? "An error occured", {
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-destructive" />,
      });
    }
  }, [verifyEmailState?.success, verifyEmailState?.message]);

  return (
    <div className="flex flex-col gap-2">
      <form ref={codeFormRef} action={verifyEmail}>
        <Label htmlFor="code">Verification Code</Label>
        <Input
          className="mt-2"
          type="text"
          id="code"
          name="code"
          defaultValue={verifyEmailState?.input?.code}
          required
        />
        <SubmitButton className="mt-4 w-full" aria-label="submit-btn">
          Verify
        </SubmitButton>
      </form>
      <form action={resendAction}>
        <SubmitButton className="w-full" variant="secondary">
          Resend Code
        </SubmitButton>
      </form>
      <form action={logout}>
        <SubmitButton variant="link" className="p-0 font-normal">
          want to use another email? Log out now.
        </SubmitButton>
      </form>
    </div>
  );
};
