"use client";

import {
  DropdownMenu,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"; 

import Link from "next/link";

export const UserDropdown = ({
  username,
  email,
}: {
  username: string;
  email: string;
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        {/* eslint @next/next/no-img-element:off */}
        <img
          src={"https://source.boringavatars.com/marble/60/" + username}
          alt="Avatar"
          className="h-8 w-8"
          width={64}
          height={64}
        ></img>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <p>{username}</p>
          <p className="text-muted-foreground">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="cursor-pointer text-muted-foreground"
            asChild
          >
            <Link href="/settings">Settings</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />

        <DropdownMenuItem className="text-muted-foreground" asChild>
          <form method="POST" action="/api/auth/logout">
            <button>Sign out</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
