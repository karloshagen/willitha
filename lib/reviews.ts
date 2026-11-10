import { getSql } from "@/lib/db";
import { logError } from "@/lib/errors";
import { cleanText, isHttpUrl, slugPattern } from "@/lib/text";

export const INTEGRATION_TYPES = ["official", "HACS", "Modbus", "MQTT", "other"] as const;

export type IntegrationType = (typeof INTEGRATION_TYPES)[number];

export type ReviewPhoto = {
  url: string;
  alt: string;
};

export type Review = {
  id: number;
  slug: string;
  title: string;
  device_name: string;
  brand: string;
  category: string;
  entry_slug: string | null;
  integration_type: IntegrationType;
  local_or_cloud: string;
  rating: number;
  summary: string;
  body: string;
  pros: string[];
  cons: string[];
  photos: ReviewPhoto[];
  affiliate_url: string | null;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

export type ReviewInput = Omit<Review, "id" | "published_at" | "updated_at">;

type ReviewRow = {
  id: number | string;
  slug: string;
  title: string;
  device_name: string;
  brand: string;
  category: string;
  entry_slug: string | null;
  integration_type: string;
  local_or_cloud: string;
  rating: number;
  summary: string;
  body: string;
  pros: unknown;
  cons: unknown;
  photos: unknown;
  affiliate_url: string | null;
  published: boolean;
  published_at: Date | string | null;
  updated_at: Date | string;
};

const REVIEW_COLUMNS = `id, slug, title, device_name, brand, category, entry_slug, integration_type,
  local_or_cloud, rating, summary, body, pros, cons, photos, affiliate_url,
  published, published_at, updated_at`;

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function stringList(value: unknown): string[] {
  return asArray(value).filter((item): item is string => typeof item === "string");
}

function photoList(value: unknown): ReviewPhoto[] {
  return asArray(value).flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const record = item as Record<string, unknown>;
    if (typeof record.url !== "string" || typeof record.alt !== "string") return [];
    return [{ url: record.url, alt: record.alt }];
  });
}

function iso(value: Date | string | null): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? String(value) : parsed.toISOString();
}

export function mapReview(row: ReviewRow): Review {
  const integration = INTEGRATION_TYPES.find((item) => item === row.integration_type) ?? "other";
  return {
    id: Number(row.id),
    slug: row.slug,
    title: row.title,
    device_name: row.device_name,
    brand: row.brand,
    category: row.category,
    entry_slug: row.entry_slug,
    integration_type: integration,
    local_or_cloud: row.local_or_cloud,
    rating: Number(row.rating),
    summary: row.summary,
    body: row.body,
    pros: stringList(row.pros),
    cons: stringList(row.cons),
    photos: photoList(row.photos),
    affiliate_url: row.affiliate_url,
    published: row.published,
    published_at: iso(row.published_at),
    updated_at: iso(row.updated_at) ?? new Date(0).toISOString(),
  };
}

function integrationLabel(value: string): string {
  switch (value) {
    case "official":
      return "Official integration";
    case "HACS":
      return "HACS";
    case "Modbus":
      return "Modbus";
    case "MQTT":
      return "MQTT";
    default:
      return "Other";
  }
}

export { integrationLabel };

async function selectReviews(whereSql: string, params: unknown[] = []): Promise<ReviewRow[]> {
  const statement = `SELECT ${REVIEW_COLUMNS} FROM reviews ${whereSql}`;
  return getSql().unsafe(statement, params as never[]);
}

async function queryReviews(whereSql: string, params: unknown[] = []): Promise<Review[] | null> {
  try {
    const rows = await selectReviews(whereSql, params);
    return rows.map(mapReview);
  } catch (error) {
    await logError(error, "/tested");
    return null;
  }
}

export async function listPublishedReviews(category = ""): Promise<Review[] | null> {
  if (category) {
    return queryReviews(
      "WHERE published = true AND category = $1 ORDER BY published_at DESC NULLS LAST, updated_at DESC",
      [category],
    );
  }
  return queryReviews("WHERE published = true ORDER BY published_at DESC NULLS LAST, updated_at DESC");
}

export async function listReviewCategories(): Promise<string[] | null> {
  try {
    const rows = await getSql()<Array<{ category: string }>>`
      SELECT DISTINCT category
      FROM reviews
      WHERE published = true
      ORDER BY category
    `;
    return rows.map((row) => row.category);
  } catch (error) {
    await logError(error, "/tested");
    return null;
  }
}

export async function getPublishedReview(slug: string): Promise<Review | null | undefined> {
  const rows = await queryReviews("WHERE slug = $1 AND published = true LIMIT 1", [slug]);
  if (rows === null) return null;
  return rows[0];
}

export async function getPublishedReviewForEntry(entrySlug: string): Promise<Review | null | undefined> {
  const rows = await queryReviews(
    "WHERE entry_slug = $1 AND published = true ORDER BY published_at DESC NULLS LAST LIMIT 1",
    [entrySlug],
  );
  if (rows === null) return null;
  return rows[0];
}

export async function listAllReviews(): Promise<Review[]> {
  const rows = await selectReviews("ORDER BY updated_at DESC");
  return rows.map(mapReview);
}

export async function getReviewBySlug(slug: string): Promise<Review | undefined> {
  const rows = await selectReviews("WHERE slug = $1 LIMIT 1", [slug]);
  return rows[0] ? mapReview(rows[0]) : undefined;
}

export async function getReviewById(id: number): Promise<Review | undefined> {
  const rows = await selectReviews("WHERE id = $1 LIMIT 1", [id]);
  return rows[0] ? mapReview(rows[0]) : undefined;
}

export async function entryExists(slug: string): Promise<boolean> {
  const rows = await getSql()<Array<{ slug: string }>>`
    SELECT slug FROM entries WHERE slug = ${slug} LIMIT 1
  `;
  return Boolean(rows[0]);
}

export async function insertReview(review: ReviewInput): Promise<Review> {
  const publishedAt = review.published ? new Date().toISOString() : null;
  const rows = await getSql()<ReviewRow[]>`
    INSERT INTO reviews (
      slug, title, device_name, brand, category, entry_slug, integration_type,
      local_or_cloud, rating, summary, body, pros, cons, photos, affiliate_url,
      published, published_at, updated_at
    ) VALUES (
      ${review.slug},
      ${review.title},
      ${review.device_name},
      ${review.brand},
      ${review.category},
      ${review.entry_slug},
      ${review.integration_type},
      ${review.local_or_cloud},
      ${review.rating},
      ${review.summary},
      ${review.body},
      ${getSql().json(review.pros)},
      ${getSql().json(review.cons)},
      ${getSql().json(review.photos)},
      ${review.affiliate_url},
      ${review.published},
      ${publishedAt},
      now()
    )
    RETURNING id, slug, title, device_name, brand, category, entry_slug, integration_type,
      local_or_cloud, rating, summary, body, pros, cons, photos, affiliate_url,
      published, published_at, updated_at
  `;
  return mapReview(rows[0]);
}

export async function saveReview(id: number, review: ReviewInput, publishedAt: string | null): Promise<Review> {
  const rows = await getSql()<ReviewRow[]>`
    UPDATE reviews SET
      slug = ${review.slug},
      title = ${review.title},
      device_name = ${review.device_name},
      brand = ${review.brand},
      category = ${review.category},
      entry_slug = ${review.entry_slug},
      integration_type = ${review.integration_type},
      local_or_cloud = ${review.local_or_cloud},
      rating = ${review.rating},
      summary = ${review.summary},
      body = ${review.body},
      pros = ${getSql().json(review.pros)},
      cons = ${getSql().json(review.cons)},
      photos = ${getSql().json(review.photos)},
      affiliate_url = ${review.affiliate_url},
      published = ${review.published},
      published_at = ${publishedAt},
      updated_at = now()
    WHERE id = ${id}
    RETURNING id, slug, title, device_name, brand, category, entry_slug, integration_type,
      local_or_cloud, rating, summary, body, pros, cons, photos, affiliate_url,
      published, published_at, updated_at
  `;
  return mapReview(rows[0]);
}

export type ReviewParse = { ok: true; review: ReviewInput } | { ok: false; error: string };

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function parseStringList(value: unknown, label: string): string[] | string {
  if (!Array.isArray(value)) return `${label} must be an array of strings`;
  if (value.length > 12) return `${label} has too many items`;
  const items: string[] = [];
  for (const item of value) {
    const text = cleanText(item, 300);
    if (!text) return `${label} items must be text`;
    items.push(text);
  }
  return items;
}

function parsePhotos(value: unknown): ReviewPhoto[] | string {
  if (!Array.isArray(value)) return "photos must be an array of { url, alt }";
  if (value.length > 12) return "Too many photos";
  const photos: ReviewPhoto[] = [];
  for (const item of value) {
    const record = asRecord(item);
    if (!record) return "Each photo needs url and alt";
    const url = cleanText(record.url, 500);
    const alt = cleanText(record.alt, 180);
    if (!isHttpUrl(url)) return "Each photo url must be http or https";
    if (!alt) return "Each photo needs alt text";
    photos.push({ url, alt });
  }
  return photos;
}

export function parseReview(value: unknown): ReviewParse {
  const record = asRecord(value);
  if (!record) return { ok: false, error: "Review must be a JSON object" };

  const slug = cleanText(record.slug, 80);
  const title = cleanText(record.title, 160);
  const deviceName = cleanText(record.device_name, 160);
  const brand = cleanText(record.brand, 80);
  const category = cleanText(record.category, 80);
  const entrySlug = cleanText(record.entry_slug, 80);
  const integration = cleanText(record.integration_type, 20);
  const localOrCloud = cleanText(record.local_or_cloud, 120);
  const summary = cleanText(record.summary, 500);
  const body = cleanText(record.body, 20000);
  const affiliate = cleanText(record.affiliate_url, 500);
  const rating = Number(record.rating);

  if (!slugPattern(slug)) return { ok: false, error: "Slug must be lowercase words separated by hyphens" };
  if (!title) return { ok: false, error: "Title is required" };
  if (!deviceName) return { ok: false, error: "device_name is required" };
  if (!brand) return { ok: false, error: "Brand is required" };
  if (!category) return { ok: false, error: "Category is required" };
  if (entrySlug && !slugPattern(entrySlug)) return { ok: false, error: "entry_slug is not a directory slug" };
  if (!INTEGRATION_TYPES.includes(integration as IntegrationType)) {
    return { ok: false, error: "integration_type must be official, HACS, Modbus, MQTT, or other" };
  }
  if (!localOrCloud) return { ok: false, error: "local_or_cloud is required" };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { ok: false, error: "rating must be an integer from 1 to 5" };
  }
  if (!summary) return { ok: false, error: "Summary is required" };
  if (!body) return { ok: false, error: "Body is required" };
  if (affiliate && !isHttpUrl(affiliate) && !affiliate.startsWith("/")) {
    return { ok: false, error: "affiliate_url must be an http(s) URL or a site path" };
  }
  if (typeof record.published !== "boolean") return { ok: false, error: "published must be true or false" };

  const pros = parseStringList(record.pros ?? [], "pros");
  if (typeof pros === "string") return { ok: false, error: pros };
  const cons = parseStringList(record.cons ?? [], "cons");
  if (typeof cons === "string") return { ok: false, error: cons };
  const photos = parsePhotos(record.photos ?? []);
  if (typeof photos === "string") return { ok: false, error: photos };

  return {
    ok: true,
    review: {
      slug,
      title,
      device_name: deviceName,
      brand,
      category,
      entry_slug: entrySlug || null,
      integration_type: integration as IntegrationType,
      local_or_cloud: localOrCloud,
      rating,
      summary,
      body,
      pros,
      cons,
      photos,
      affiliate_url: affiliate || null,
      published: record.published,
    },
  };
}

export type ReviewPatch =
  | { ok: true; id: number | null; slug: string | null; patch: Partial<ReviewInput> }
  | { ok: false; error: string };

export function parseReviewPatch(value: unknown): ReviewPatch {
  const record = asRecord(value);
  if (!record) return { ok: false, error: "Review must be a JSON object" };

  const id = record.id === undefined || record.id === null ? null : Number(record.id);
  if (record.id !== undefined && record.id !== null && (!Number.isInteger(id) || (id ?? 0) <= 0)) {
    return { ok: false, error: "id must be a positive integer" };
  }

  let lookupSlug: string | null = null;
  const patch: Partial<ReviewInput> = {};

  if (typeof record.slug === "string") {
    const slug = cleanText(record.slug, 80);
    if (!slugPattern(slug)) return { ok: false, error: "Slug must be lowercase words separated by hyphens" };
    if (id) patch.slug = slug;
    else lookupSlug = slug;
  }
  if (!id && !lookupSlug) return { ok: false, error: "slug or id is required" };

  if ("title" in record) {
    const title = cleanText(record.title, 160);
    if (!title) return { ok: false, error: "Title is required" };
    patch.title = title;
  }
  if ("device_name" in record) {
    const deviceName = cleanText(record.device_name, 160);
    if (!deviceName) return { ok: false, error: "device_name is required" };
    patch.device_name = deviceName;
  }
  if ("brand" in record) {
    const brand = cleanText(record.brand, 80);
    if (!brand) return { ok: false, error: "Brand is required" };
    patch.brand = brand;
  }
  if ("category" in record) {
    const category = cleanText(record.category, 80);
    if (!category) return { ok: false, error: "Category is required" };
    patch.category = category;
  }
  if ("entry_slug" in record) {
    if (record.entry_slug === null || cleanText(record.entry_slug, 80) === "") {
      patch.entry_slug = null;
    } else {
      const entrySlug = cleanText(record.entry_slug, 80);
      if (!slugPattern(entrySlug)) return { ok: false, error: "entry_slug is not a directory slug" };
      patch.entry_slug = entrySlug;
    }
  }
  if ("integration_type" in record) {
    const integration = cleanText(record.integration_type, 20);
    if (!INTEGRATION_TYPES.includes(integration as IntegrationType)) {
      return { ok: false, error: "integration_type must be official, HACS, Modbus, MQTT, or other" };
    }
    patch.integration_type = integration as IntegrationType;
  }
  if ("local_or_cloud" in record) {
    const localOrCloud = cleanText(record.local_or_cloud, 120);
    if (!localOrCloud) return { ok: false, error: "local_or_cloud is required" };
    patch.local_or_cloud = localOrCloud;
  }
  if ("rating" in record) {
    const rating = Number(record.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return { ok: false, error: "rating must be an integer from 1 to 5" };
    }
    patch.rating = rating;
  }
  if ("summary" in record) {
    const summary = cleanText(record.summary, 500);
    if (!summary) return { ok: false, error: "Summary is required" };
    patch.summary = summary;
  }
  if ("body" in record) {
    const body = cleanText(record.body, 20000);
    if (!body) return { ok: false, error: "Body is required" };
    patch.body = body;
  }
  if ("pros" in record) {
    const pros = parseStringList(record.pros, "pros");
    if (typeof pros === "string") return { ok: false, error: pros };
    patch.pros = pros;
  }
  if ("cons" in record) {
    const cons = parseStringList(record.cons, "cons");
    if (typeof cons === "string") return { ok: false, error: cons };
    patch.cons = cons;
  }
  if ("photos" in record) {
    const photos = parsePhotos(record.photos);
    if (typeof photos === "string") return { ok: false, error: photos };
    patch.photos = photos;
  }
  if ("affiliate_url" in record) {
    if (record.affiliate_url === null || cleanText(record.affiliate_url, 500) === "") {
      patch.affiliate_url = null;
    } else {
      const affiliate = cleanText(record.affiliate_url, 500);
      if (!isHttpUrl(affiliate) && !affiliate.startsWith("/")) {
        return { ok: false, error: "affiliate_url must be an http(s) URL or a site path" };
      }
      patch.affiliate_url = affiliate;
    }
  }
  if ("published" in record) {
    if (typeof record.published !== "boolean") return { ok: false, error: "published must be true or false" };
    patch.published = record.published;
  }

  if (Object.keys(patch).length === 0) return { ok: false, error: "No review fields to update" };
  return { ok: true, id, slug: lookupSlug, patch };
}
