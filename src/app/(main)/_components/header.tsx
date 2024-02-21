import Link from "next/link";
import { RocketIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { UserDropdown } from "@/app/(main)/_components/user-dropdown";
import { validateRequest } from "@/lib/auth/validate-request";

export const Header = async () => {
  const { user } = await validateRequest();

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 p-0">
      <div className="container flex items-center gap-2 px-2 py-2 lg:px-4">
        <Link className="flex items-center justify-center text-xl font-medium" href="/">
          <RocketIcon className="mr-2 h-5 w-5" /> {APP_TITLE} Dashboard
        </Link>
        {user ? <UserDropdown email={user.email} avatar={user.avatar} className="ml-auto" /> : null}
      </div>
    </header>
  );
};
