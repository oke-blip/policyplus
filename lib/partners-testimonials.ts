export type PartnerRecord = {
  id: number;
  name: string;
  image?: string;
};

export type TestimonialRecord = {
  id: number;
  quote: string;
  author: string;
  role: string;
  image?: string;
  quote_id?: string;
  author_id?: string;
  role_id?: string;
};

export type TestimonialIdRecord = {
  id: number;
  quote_id: string;
  author_id: string;
  role_id: string;
};

const IMAGE_URL_RE = /^https?:\/\//i;

/** Stable numeric id for testimonial/partner rows (JSON may store number or numeric string). */
export function normalizeRecordId(id: unknown, index: number): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string") {
    const trimmed = id.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
  }
  return Date.now() + index;
}

/** Persist only empty strings or http(s) URLs — never base64 or blob previews. */
export function sanitizePartnerImage(image: string | undefined): string {
  const trimmed = (image ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return "";
  if (IMAGE_URL_RE.test(trimmed)) return trimmed;
  return "";
}

export function parsePartners(value: unknown): PartnerRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === "object")
    .map((p, index) => ({
      id: normalizeRecordId(p.id, index),
      name: String(p.name ?? "").trim() || "New Partner",
      image: sanitizePartnerImage(typeof p.image === "string" ? p.image : ""),
    }));
}

export function preparePartnersForSave(partners: PartnerRecord[]): PartnerRecord[] {
  return partners.map(({ id, name, image }) => ({
    id,
    name: name.trim() || "New Partner",
    image: sanitizePartnerImage(image),
  }));
}

export function parseTestimonials(value: unknown): TestimonialRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === "object")
    .map((t, index) => ({
      id: normalizeRecordId(t.id, index),
      quote: String(t.quote ?? ""),
      author: String(t.author ?? ""),
      role: String(t.role ?? ""),
      image: sanitizePartnerImage(typeof t.image === "string" ? t.image : ""),
      quote_id:
        typeof t.quote_id === "string" ? t.quote_id : undefined,
      author_id:
        typeof t.author_id === "string" ? t.author_id : undefined,
      role_id: typeof t.role_id === "string" ? t.role_id : undefined,
    }));
}

export function parseTestimonialIdRows(value: unknown): TestimonialIdRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((t): t is Record<string, unknown> => Boolean(t) && typeof t === "object")
    .map((t, index) => ({
      id: normalizeRecordId(t.id, index),
      quote_id: String(t.quote_id ?? ""),
      author_id: String(t.author_id ?? ""),
      role_id: String(t.role_id ?? ""),
    }));
}

export function mergeTestimonialIdFields(
  testimonials: TestimonialRecord[],
  idRows: TestimonialIdRecord[],
): TestimonialRecord[] {
  if (!idRows.length) return testimonials;

  const byId = new Map(idRows.map((row) => [row.id, row]));
  return testimonials.map((item) => {
    const idRow = byId.get(item.id);
    if (!idRow) return item;
    return {
      ...item,
      quote_id: idRow.quote_id.trim() || undefined,
      author_id: idRow.author_id.trim() || undefined,
      role_id: idRow.role_id.trim() || undefined,
    };
  });
}

export function extractTestimonialIdRows(
  testimonials: TestimonialRecord[],
): TestimonialIdRecord[] {
  return testimonials.map(({ id, quote_id, author_id, role_id }) => ({
    id,
    quote_id: (quote_id ?? "").trim(),
    author_id: (author_id ?? "").trim(),
    role_id: (role_id ?? "").trim(),
  }));
}

export function prepareTestimonialIdRowsForSave(
  rows: TestimonialIdRecord[],
): TestimonialIdRecord[] {
  return rows.map(({ id, quote_id, author_id, role_id }) => ({
    id,
    quote_id: quote_id.trim(),
    author_id: author_id.trim(),
    role_id: role_id.trim(),
  }));
}

export function prepareTestimonialsForSave(
  testimonials: TestimonialRecord[],
): TestimonialRecord[] {
  return testimonials.map(({ id, quote, author, role, image }) => ({
    id,
    quote: quote.trim(),
    author: author.trim(),
    role: role.trim(),
    image: sanitizePartnerImage(image),
  }));
}

export function parsePartnersHeaderId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseTestimonialsHeaderId(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function hasUnsavedPartnerImages(partners: PartnerRecord[]): boolean {
  return partners.some((p) => {
    const image = (p.image ?? "").trim();
    return image.startsWith("data:") || image.startsWith("blob:");
  });
}

export function hasUnsavedTestimonialImages(testimonials: TestimonialRecord[]): boolean {
  return testimonials.some((t) => {
    const image = (t.image ?? "").trim();
    return image.startsWith("data:") || image.startsWith("blob:");
  });
}

export function parsePartnersHeader(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "OUR PARTNERS";
  return value.trim();
}

export function parseTestimonialsHeader(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return "WHAT OUR CLIENTS SAY";
  return value.trim();
}
