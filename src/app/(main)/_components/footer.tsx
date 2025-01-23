import { ThemeToggle } from "@/components/theme-toggle";
import { CodeIcon } from "@radix-ui/react-icons";

const repoUrl = "https://github.com/saasykits/nextjs-sessionauth-template";
const orgUrl = "https://github.com/saasykits";

export const Footer = () => {
  return (
    <footer className="mt-2 px-4 py-2">
      <div className="container flex items-center p-0">
        <CodeIcon className="mr-2 h-6 w-6" />
        <p className="text-sm">
          Built by{" "}
          <a className="underline underline-offset-4" href={orgUrl}>
            saasykits
          </a>
          . Get the source code from{" "}
          <a className="underline underline-offset-4" href={repoUrl}>
            GitHub
          </a>
          .
        </p>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </footer>
  );
};
