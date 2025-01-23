"use client";

import { AnimatedSpinnerIcon } from "@/components/icons";
import { Button, type ButtonProps } from "@/components/ui/button";

import { cn } from "@/lib/utils";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
}

export function LoadingButton({ loading = false, children, ...props }: LoadingButtonProps) {
  return (
    <Button
      {...props}
      disabled={props.disabled ? props.disabled : loading}
      className={cn(props.className, "relative")}
    >
      <span className={cn(loading ? "opacity-0" : "")}>{children}</span>
      {loading ? (
        <div className="absolute inset-0 grid place-items-center">
          <AnimatedSpinnerIcon className="h-6 w-6" />
        </div>
      ) : null}
    </Button>
  );
}
