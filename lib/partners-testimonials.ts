export const PARTNER_MEDIA_TYPES = ["PARTNER", "MEDIA_COVERAGE"] as const;
export type PartnerMediaType = (typeof PARTNER_MEDIA_TYPES)[number];

/** Canonical logo row stored in `partners_items` (Setting JSON). */
export type UnifiedLogoRecord = {
  id: number;
  type: PartnerMediaType;
  name: string;
  name_id?: string;
  description?: string;
  description_id?: string;
  image?: string;
};

export type PartnerRecord = {
  id: number;
  name: string;
  image?: string;
};

/** Media coverage logo row (subset of unified record). */
export type MediaCoverageRecord = {
  id: number;
  name: string;
  name_id?: string;
  description?: string;
  description_id?: string;
  image?: string;
};

/** @deprecated Legacy quote-style testimonials; kept for backward-compat reads. */
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

/** @deprecated Legacy ID rows for testimonials in `value_id`. */
export type TestimonialIdRecord = {
  id: number;
  quote_id: string;
  author_id: string;
  role_id: string;
};

const IMAGE_URL_RE = /^https?:\/\//i;
const DEFAULT_PARTNERS_HEADER = "OUR PARTNERS";
const DEFAULT_MEDIA_COVERAGE_HEADER = "MEDIA COVERAGE";

/** Stable numeric id for logo rows (JSON may store number or numeric string). */
export function normalizeRecordId(id: unknown, index: number): number {
  if (typeof id === "number" && Number.isFinite(id)) return id;
  if (typeof id === "string") {
    const trimmed = id.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
  }
  return Date.now() + index;
}

function normalizePartnerMediaType(value: unknown): PartnerMediaType {
  const raw = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (raw === "MEDIA_COVERAGE" || raw === "MEDIA" || raw === "TESTIMONIAL") {
    return "MEDIA_COVERAGE";
  }
  return "PARTNER";
}

/** Persist only empty strings or http(s) URLs — never base64 or blob previews. */
export function sanitizePartnerImage(image: string | undefined): string {
  const trimmed = (image ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return "";
  if (IMAGE_URL_RE.test(trimmed)) return trimmed;
  return "";
}

export function parseUnifiedLogoItems(value: unknown): UnifiedLogoRecord[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === "object")
    .map((p, index) => {
      const name = String(p.name ?? "").trim();
      const name_id =
        typeof p.name_id === "string" ? p.name_id.trim() || undefined : undefined;
      const description =
        typeof p.description === "string" ? p.description.trim() || undefined : undefined;
      const description_id =
        typeof p.description_id === "string"
          ? p.description_id.trim() || undefined
          : undefined;
      return {
        id: normalizeRecordId(p.id, index),
        type: normalizePartnerMediaType(p.type),
        name: name || (normalizePartnerMediaType(p.type) === "PARTNER" ? "New Partner" : ""),
        ...(name_id ? { name_id } : {}),
        ...(description ? { description } : {}),
        ...(description_id ? { description_id } : {}),
        image: sanitizePartnerImage(typeof p.image === "string" ? p.image : ""),
      };
    });
}

export function splitLogoItemsByType(items: UnifiedLogoRecord[]): {
  partners: PartnerRecord[];
  mediaCoverage: MediaCoverageRecord[];
} {
  const partners: PartnerRecord[] = [];
  const mediaCoverage: MediaCoverageRecord[] = [];

  for (const item of items) {
    if (item.type === "MEDIA_COVERAGE") {
      mediaCoverage.push({
        id: item.id,
        name: item.name,
        ...(item.name_id ? { name_id: item.name_id } : {}),
        ...(item.description ? { description: item.description } : {}),
        ...(item.description_id ? { description_id: item.description_id } : {}),
        image: item.image,
      });
    } else {
      partners.push({
        id: item.id,
        name: item.name || "New Partner",
        image: item.image,
      });
    }
  }

  return { partners, mediaCoverage };
}

export function mergeLogoItems(
  partners: PartnerRecord[],
  mediaCoverage: MediaCoverageRecord[],
): UnifiedLogoRecord[] {
  return [
    ...partners.map((p) => ({
      id: p.id,
      type: "PARTNER" as const,
      name: p.name,
      image: p.image,
    })),
    ...mediaCoverage.map((m) => ({
      id: m.id,
      type: "MEDIA_COVERAGE" as const,
      name: m.name,
      ...(m.name_id ? { name_id: m.name_id } : {}),
      ...(m.description ? { description: m.description } : {}),
      ...(m.description_id ? { description_id: m.description_id } : {}),
      image: m.image,
    })),
  ];
}

/** Load unified items from settings; merges legacy `partners` + `testimonials` when needed. */
export function loadLogoItemsFromSettings(
  data: Record<string, unknown>,
): UnifiedLogoRecord[] {
  const unified = parseUnifiedLogoItems(data.partners_items);
  if (unified.length > 0) return unified;

  const partners = parsePartners(data.partners).map((p) => ({
    id: p.id,
    type: "PARTNER" as const,
    name: p.name,
    image: p.image,
  }));

  const mediaFromTestimonials = parseTestimonials(data.testimonials).map(
    testimonialToMediaCoverage,
  );

  return [
    ...partners,
    ...mediaFromTestimonials.map((m) => ({
      id: m.id,
      type: "MEDIA_COVERAGE" as const,
      name: m.name,
      ...(m.name_id ? { name_id: m.name_id } : {}),
      ...(m.description ? { description: m.description } : {}),
      ...(m.description_id ? { description_id: m.description_id } : {}),
      image: m.image,
    })),
  ];
}

function testimonialToMediaCoverage(t: TestimonialRecord): MediaCoverageRecord {
  return {
    id: t.id,
    name: t.author.trim(),
    ...(t.author_id?.trim() ? { name_id: t.author_id.trim() } : {}),
    image: t.image,
  };
}

export function prepareUnifiedLogoItemsForSave(
  items: UnifiedLogoRecord[],
): UnifiedLogoRecord[] {
  return items.map(({ id, type, name, name_id, description, description_id, image }) => {
    const trimmedName = name.trim();
    const record: UnifiedLogoRecord = {
      id,
      type,
      name:
        type === "PARTNER"
          ? trimmedName || "New Partner"
          : trimmedName,
      image: sanitizePartnerImage(image),
    };
    const trimmedNameId = name_id?.trim();
    const trimmedDescription = description?.trim();
    const trimmedDescriptionId = description_id?.trim();
    if (trimmedNameId) record.name_id = trimmedNameId;
    if (trimmedDescription) record.description = trimmedDescription;
    if (trimmedDescriptionId) record.description_id = trimmedDescriptionId;
    return record;
  });
}

export function parsePartners(value: unknown): PartnerRecord[] {
  const fromUnified = parseUnifiedLogoItems(value)
    .filter((item) => item.type === "PARTNER")
    .map(({ id, name, image }) => ({ id, name, image }));
  if (fromUnified.length > 0) return fromUnified;

  if (!Array.isArray(value)) return [];

  return value
    .filter((p): p is Record<string, unknown> => Boolean(p) && typeof p === "object")
    .map((p, index) => ({
      id: normalizeRecordId(p.id, index),
      name: String(p.name ?? "").trim() || "New Partner",
      image: sanitizePartnerImage(typeof p.image === "string" ? p.image : ""),
    }));
}

export function parseMediaCoverage(value: unknown): MediaCoverageRecord[] {
  const fromUnified = parseUnifiedLogoItems(value)
    .filter((item) => item.type === "MEDIA_COVERAGE")
    .map(({ id, name, name_id, description, description_id, image }) => ({
      id,
      name,
      ...(name_id ? { name_id } : {}),
      ...(description ? { description } : {}),
      ...(description_id ? { description_id } : {}),
      image,
    }));
  if (fromUnified.length > 0) return fromUnified;

  return parseTestimonials(value).map(testimonialToMediaCoverage);
}

export function preparePartnersForSave(partners: PartnerRecord[]): PartnerRecord[] {
  return partners.map(({ id, name, image }) => ({
    id,
    name: name.trim() || "New Partner",
    image: sanitizePartnerImage(image),
  }));
}

export function prepareMediaCoverageForSave(
  items: MediaCoverageRecord[],
): MediaCoverageRecord[] {
  return items.map(({ id, name, name_id, description, description_id, image }) => {
    const record: MediaCoverageRecord = {
      id,
      name: name.trim(),
      image: sanitizePartnerImage(image),
    };
    const trimmedNameId = name_id?.trim();
    const trimmedDescription = description?.trim();
    const trimmedDescriptionId = description_id?.trim();
    if (trimmedNameId) record.name_id = trimmedNameId;
    if (trimmedDescription) record.description = trimmedDescription;
    if (trimmedDescriptionId) record.description_id = trimmedDescriptionId;
    return record;
  });
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
      quote_id: typeof t.quote_id === "string" ? t.quote_id : undefined,
      author_id: typeof t.author_id === "string" ? t.author_id : undefined,
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

export function parsePartnersDescription(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parsePartnersDescriptionId(value: unknown): string {
  return parsePartnersHeaderId(value);
}

export function parseMediaCoverageHeaderId(
  data: Record<string, unknown>,
): string {
  const primary = data.media_coverage_header_id;
  if (typeof primary === "string" && primary.trim()) return primary.trim();
  return parseTestimonialsHeaderId(data.testimonials_header_id);
}

export function parseMediaCoverageDescription(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseMediaCoverageDescriptionId(value: unknown): string {
  return parseMediaCoverageDescription(value);
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

export function hasUnsavedMediaCoverageImages(items: MediaCoverageRecord[]): boolean {
  return items.some((item) => {
    const image = (item.image ?? "").trim();
    return image.startsWith("data:") || image.startsWith("blob:");
  });
}

export function hasUnsavedTestimonialImages(testimonials: TestimonialRecord[]): boolean {
  return hasUnsavedMediaCoverageImages(
    testimonials.map(testimonialToMediaCoverage),
  );
}

export function parsePartnersHeader(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return DEFAULT_PARTNERS_HEADER;
  return value.trim();
}

export function parseMediaCoverageHeader(data: Record<string, unknown>): string {
  const primary = data.media_coverage_header;
  if (typeof primary === "string" && primary.trim()) return primary.trim();
  return parseTestimonialsHeader(data.testimonials_header);
}

export function parseTestimonialsHeader(value: unknown): string {
  if (typeof value !== "string" || !value.trim()) return DEFAULT_MEDIA_COVERAGE_HEADER;
  return value.trim();
}

export type MediaCoverageDisplayLogo = {
  id: number;
  name: string;
  image: string;
};

/** Public homepage: logos with image URL and localized optional name. */
export function getMediaCoverageDisplayLogos(
  data: Record<string, unknown> | undefined,
  locale: "en" | "id",
): MediaCoverageDisplayLogo[] {
  const { mediaCoverage } = splitLogoItemsByType(
    loadLogoItemsFromSettings(data ?? {}),
  );

  return mediaCoverage
    .filter((item) => item.image?.trim())
    .map((item) => ({
      id: item.id,
      name:
        locale === "id" && item.name_id?.trim()
          ? item.name_id.trim()
          : item.name.trim(),
      image: item.image!.trim(),
    }));
}

export type MediaCoverageSectionCopy = {
  header: string;
  description: string;
};

export function resolveMediaCoverageSectionCopy(
  data: Record<string, unknown> | undefined,
  locale: "en" | "id",
  fallbackHeader: string,
): MediaCoverageSectionCopy {
  const settings = data ?? {};
  const headerEn = parseMediaCoverageHeader(settings);
  const headerId = parseMediaCoverageHeaderId(settings);
  const header =
    locale === "id" && headerId.trim() ? headerId.trim() : headerEn.trim();

  const descriptionEn = parseMediaCoverageDescription(
    settings.media_coverage_description,
  );
  const descriptionId = parseMediaCoverageDescriptionId(
    settings.media_coverage_description_id,
  );
  const description =
    locale === "id" && descriptionId.trim()
      ? descriptionId.trim()
      : descriptionEn.trim();

  return {
    header: header || fallbackHeader,
    description,
  };
}
