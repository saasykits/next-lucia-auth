// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import utils from "./lib/auth/utils";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (request.method === "GET") {
    return NextResponse.next();
  }
  const originHeader = request.headers.get("Origin");
  const hostHeader = request.headers.get("Host");
  console.log("originHeader", originHeader);
  console.log("hostHeader", hostHeader);
}

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next|favicon.ico|sitemap.xml|robots.txt).*)"],
};
