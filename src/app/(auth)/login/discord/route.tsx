import { env } from "@/env";
import * as context from "next/headers";

export const GET = async () => {
  return new Response(null, {
    status: 302,
    headers: {},
  });
};
