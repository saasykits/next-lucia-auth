import { LuciaError } from "lucia";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getExceptionType = (error: unknown) => {
  const UnknownException = {
    type: "UnknownException",
    status: 500,
    message: "An unknown error occurred",
  };

  if (!error) return UnknownException;

  if ((error as Record<string, unknown>).name === "DatabaseError") {
    return {
      type: "DatabaseException",
      status: 400,
      message: "Duplicate key entry",
    };
  }

  if (error instanceof LuciaError) {
    switch (error.message) {
      case "AUTH_INVALID_KEY_ID":
      case "AUTH_INVALID_PASSWORD":
        return {
          type: "InvalidCredentialException",
          status: 400,
          message: "Username or password is incorrect",
        };
      default:
        return UnknownException;
    }
  }

  return UnknownException;
};
