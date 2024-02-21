import { ExclamationTriangleIcon } from "@/components/icons";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { validateRequest } from "@/lib/auth/validate-request";
import Link from "next/link";

export async function VerificiationWarning() {
  const { user } = await validateRequest();

  return user?.emailVerified === false ? (
    <Alert className="rounded-lg bg-yellow-50 text-yellow-700 dark:bg-gray-800 dark:text-yellow-400">
      <ExclamationTriangleIcon className="h-5 w-5 !text-yellow-700 dark:!text-yellow-400" />
      <div className="flex lg:items-center">
        <div className="w-full">
          <AlertTitle>Account verification required</AlertTitle>
          <AlertDescription>
            A verification email has been sent to your email address. Please verify your account to
            access all features.
          </AlertDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/verify-email">Verify Email</Link>
        </Button>
      </div>
    </Alert>
  ) : null;
}
