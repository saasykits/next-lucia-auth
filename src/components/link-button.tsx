import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { ComponentProps } from "react";

type LinkProps = Omit<ComponentProps<typeof Link>, "href">;
export type LoadingButtonProps = Omit<ButtonProps, "asChild"> & {
  href: string;
  linkProps?: LinkProps;
};

export function LinkButton({ href, children, linkProps, disabled, ...props }: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={disabled}
      asChild={!disabled}
      className={cn(props.className, "relative")}
    >
      {disabled ? (
        children
      ) : (
        <Link href={href} {...linkProps}>
          {children}
        </Link>
      )}
    </Button>
  );
}
