import { cn } from "@/lib/utils";
import { Label } from "@radix-ui/react-label";
import { useId, type ComponentProps } from "react";
import { PasswordInput } from "./password-input";
import { Input } from "./ui/input";

export default function TextInput({
  label,
  helperText,
  error,
  className,
  containerClassName,
  helperTextClassName,
  ...props
}: ComponentProps<"input"> & {
  label: string;
  name: string;
  helperText?: string;
  error?: boolean;
  containerClassName?: string;
  helperTextClassName?: string;
}) {
  const autoId = useId();
  const id = props.id?.length ? props.id : autoId;

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <Label htmlFor={id}>{label}</Label>
      {props.type === "password" ? (
        <PasswordInput
          {...props}
          className={cn(className, error ? "ring-1 ring-destructive" : undefined)}
          id={id}
        />
      ) : (
        <Input {...props} id={id} />
      )}
      {helperText ? (
        <p
          className={cn(
            "text-[0.8rem] font-medium",
            error ? "text-destructive" : "text-muted-foreground",
            helperTextClassName,
          )}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
