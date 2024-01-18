import Link from "next/link";
import { RocketIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { type User } from "lucia";
import { UserDropdown } from "@/components/user-dropdown";

const routes = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  {
    name: "Documentation",
    href: "https://www.touha.dev/posts/simple-nextjs-t3-authentication-with-lucia",
  },
] as const;

const Header = ({ user }: { user: User }) => {
  return (
    <header className="sticky border-b bg-background/80 px-4 py-2 shadow-lg backdrop-blur-sm">
      <div className="flex items-center">
        <Link
          className="flex items-center justify-center text-xl font-medium"
          href="/"
        >
          <RocketIcon className="mr-2 h-5 w-5" /> {APP_TITLE}
        </Link>
        <nav className="ml-10 flex gap-4 sm:gap-6">
          {routes.map(({ name, href }) => (
            <Link
              key={name}
              className="text-sm font-medium text-muted-foreground/70 transition-colors hover:text-muted-foreground"
              href={href}
            >
              {name}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <UserDropdown username={user.fullName} email={user.email} />
        </div>
      </div>
    </header>
  );
};

export default Header;
