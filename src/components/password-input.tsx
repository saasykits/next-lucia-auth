"use client";

import { EyeCloseIcon, EyeOpenIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input, type InputProps } from "@/components/ui/input";
import * as React from "react";

import { cn } from "@/lib/utils";

const PasswordInputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type: _, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          ref={ref}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
          onClick={() => setShowPassword((prev) => !prev)}
          disabled={props.value === "" || props.disabled}
        >
          {showPassword ? (
            <EyeCloseIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <EyeOpenIcon className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
        </Button>
      </div>
    );
  },
);
PasswordInputComponent.displayName = "PasswordInput";

export const PasswordInput = PasswordInputComponent;
