/*
@Author: siddiquiaffan
@Desc: Utility functions for role based access
*/

import { type Role } from "@/server/db/schema";
import { validateRequest } from './validate-request'
import { cache } from "react";

export async function uncachedCheckAccess(
  role: Role | Role[],
  {
    method,
  }: {
    method: "some" | "every";
  } = { method: "some" },
): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user) {
    return false;
  }

  // admin can access everything
  if (user.roles?.includes("admin")) {
    return true;
  }

  if (Array.isArray(role)) {
    return role[method]((r: string) => user.roles?.includes(r as Role));
  }

  return !!user.roles?.includes(role as Role);
}

/**
 * Check if the user has access
 */
export const checkAccess = cache(uncachedCheckAccess);


// ============== { Separate methods for each role type } ==============
export async function isModerator(): Promise<boolean> {
  return checkAccess("moderator");
}

export async function isAdmin(): Promise<boolean> {
  return checkAccess("admin");
}

export async function isContentCreator(): Promise<boolean> {
  return checkAccess("content-creator");
}

export async function isOnlyUser(): Promise<boolean> {
  const { user } = await validateRequest();
  if (!user) {
    return false;
  }
  return user.roles?.length === 1 && user.roles[0] === "user";
}
