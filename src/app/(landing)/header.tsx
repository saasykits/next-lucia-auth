import Link from "next/link";
import { RocketIcon } from "@/components/icons";
import { APP_TITLE } from "@/lib/constants";

const routes = [
  { name: "Home", href: "/" },
  { name: "Features", href: "/#features" },
  { name: "Documentation", href: "/documentation" },
] as const;

const Header = () => {
  return (
    <header className="px-2 py-4 lg:py-6">
      <div className="container flex items-center">
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
      </div>
    </header>
  );
};

export default Header;
