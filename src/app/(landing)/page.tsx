import Link from "next/link";
import { type Metadata } from "next";
import Image from "next/image";
import { PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { FileTextIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import { CopyToClipboard } from "./copy-to-clipboard";

export const metadata: Metadata = {
  title: "NextJs Lucia Auth Starter Template",
  description:
    "A Next.js starter with Nextjs and Lucia auth. Includes drizzle, trpc, react-email, tailwindcss and shadcn-ui",
};

const githubUrl = "https://github.com/iamtouha/t3-lucia_auth-example";
const docUrl =
  "https://www.touha.dev/posts/simple-nextjs-t3-authentication-with-lucia";

const HomePage = () => {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-100px)] items-center">
      <div className="p-4">
        <div className="mb-10 flex items-center justify-center gap-3">
          <Image
            src={"/nextjs-logo.svg"}
            alt="NextJs logo"
            className="h-16 w-16 rounded-full border"
            width={200}
            height={200}
          />
          <PlusIcon className="h-6 w-6" />
          <Image
            src={"/lucia-logo.svg"}
            alt="NextJs logo"
            className="h-14 w-14"
            width={200}
            height={200}
          />
        </div>
        <h1 className="text-center text-3xl font-bold md:text-4xl lg:text-5xl">
          NextJs Lucia Auth Starter Template
        </h1>
        <p className="mb-10 mt-4 text-center text-muted-foreground md:text-lg lg:text-xl">
          A Next.js starter with Nextjs and Lucia auth. Includes drizzle, tRPC,
          tailwindcss, shadcn-ui and react-email
        </p>
        <div className="mb-10">
          <div className="mx-auto max-w-sm">
            <CopyToClipboard text={"git clone " + githubUrl} />
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Button size="lg" variant="outline" asChild>
            <a href={githubUrl}>
              <GitHubLogoIcon className="mr-1 h-5 w-5" />
              GitHub
            </a>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href={docUrl}>
              <FileTextIcon className="mr-1 h-5 w-5" />
              Docs
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HomePage;
