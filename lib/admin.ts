import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { logError } from "@/lib/errors";

export class AdminError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function isAdmin(request: Request): boolean {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return false;
  const header = request.headers.get("authorization") ?? "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) return false;
  const presented = header.slice(prefix.length);
  const left = createHash("sha256").update(presented).digest();
  const right = createHash("sha256").update(expected).digest();
  return timingSafeEqual(left, right);
}

export function adminJson(handler: (request: Request) => Promise<Response>) {
  return async function route(request: Request): Promise<Response> {
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
    }
    try {
      return await handler(request);
    } catch (error) {
      if (error instanceof AdminError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      await logError(error, new URL(request.url).pathname);
      return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
  };
}

export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    throw new AdminError("Body must be JSON", 400);
  }
}
