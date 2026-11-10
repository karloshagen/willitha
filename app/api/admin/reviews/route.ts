import { NextResponse } from "next/server";
import { AdminError, adminJson, readJson } from "@/lib/admin";
import {
  entryExists,
  getReviewById,
  getReviewBySlug,
  insertReview,
  listAllReviews,
  parseReview,
  parseReviewPatch,
  saveReview,
  type Review,
  type ReviewInput,
} from "@/lib/reviews";

export const dynamic = "force-dynamic";

function publishedAtFor(existing: Review | null, published: boolean): string | null {
  if (!published) return existing?.published_at ?? null;
  return existing?.published_at ?? new Date().toISOString();
}

async function assertEntry(entrySlug: string | null | undefined) {
  if (!entrySlug) return;
  if (!(await entryExists(entrySlug))) {
    throw new AdminError("entry_slug is not in the directory", 400);
  }
}

export const GET = adminJson(async () => {
  const reviews = await listAllReviews();
  return NextResponse.json({ reviews });
});

export const POST = adminJson(async (request) => {
  const parsed = parseReview(await readJson(request));
  if (!parsed.ok) throw new AdminError(parsed.error, 400);
  await assertEntry(parsed.review.entry_slug);
  if (await getReviewBySlug(parsed.review.slug)) {
    throw new AdminError("A review with that slug already exists. Use PATCH to update it.", 409);
  }
  const review = await insertReview(parsed.review);
  return NextResponse.json({ ok: true, review }, { status: 201 });
});

export const PATCH = adminJson(async (request) => {
  const parsed = parseReviewPatch(await readJson(request));
  if (!parsed.ok) throw new AdminError(parsed.error, 400);

  const existing = parsed.id ? await getReviewById(parsed.id) : await getReviewBySlug(parsed.slug ?? "");
  if (!existing) throw new AdminError("Review not found", 404);

  const next: ReviewInput = {
    slug: existing.slug,
    title: existing.title,
    device_name: existing.device_name,
    brand: existing.brand,
    category: existing.category,
    entry_slug: existing.entry_slug,
    integration_type: existing.integration_type,
    local_or_cloud: existing.local_or_cloud,
    rating: existing.rating,
    summary: existing.summary,
    body: existing.body,
    pros: existing.pros,
    cons: existing.cons,
    photos: existing.photos,
    affiliate_url: existing.affiliate_url,
    published: existing.published,
    ...parsed.patch,
  };

  if (next.slug !== existing.slug && (await getReviewBySlug(next.slug))) {
    throw new AdminError("A review with that slug already exists", 409);
  }
  await assertEntry(next.entry_slug);

  const review = await saveReview(existing.id, next, publishedAtFor(existing, next.published));
  return NextResponse.json({ ok: true, review });
});
