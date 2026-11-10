import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { logError } from "@/lib/errors";
import { findLink, logSponsorClick } from "@/lib/sponsors";
import { isHttpUrl, safeReferrer } from "@/lib/text";

export const dynamic = "force-dynamic";

export async function GET(request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  let link: Awaited<ReturnType<typeof findLink>>;
  try {
    link = await findLink(slug);
  } catch (error) {
    await logError(error, `/go/${slug}`);
    return new NextResponse("This redirect is unavailable right now.", { status: 503 });
  }
  if (!link || !isHttpUrl(link.url)) notFound();

  const url = new URL(request.url);
  const from = url.searchParams.get("from") ?? "";
  const path = from.startsWith("/") && !from.startsWith("//") ? from.slice(0, 300) : `/go/${slug}`;
  try {
    await logSponsorClick({
      slug,
      referrer: safeReferrer(request.headers.get("referer")),
      path,
    });
  } catch (error) {
    await logError(error, `/go/${slug}`);
  }

  return NextResponse.redirect(link.url, 302);
}
