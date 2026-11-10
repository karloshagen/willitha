import { NextResponse } from "next/server";
import { adminJson } from "@/lib/admin";
import { adminStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export const GET = adminJson(async () => {
  return NextResponse.json(await adminStats());
});
