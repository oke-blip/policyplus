export type HeroBanner = { src: string; alt: string };

/** Parse Prisma Json / stringified JSON into a usable value. */
export function parseSettingValue(value: unknown): unknown {
  if (value === null || value === undefined) return value;
  if (typeof value !== "string") return value;

  let current: unknown = value;
  for (let i = 0; i < 3; i++) {
    if (typeof current !== "string") break;
    try {
      current = JSON.parse(current);
    } catch {
      break;
    }
  }
  return current;
}

export type ExpertiseItem = {
  id?: number | string;
  tag: string;
  title: string;
  desc?: string;
  image?: string;
};

export function parseExpertiseItems(raw: unknown): ExpertiseItem[] {
  const value = parseSettingValue(raw);
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const tag = String(item.tag ?? "").trim();
      const title = String(item.title ?? "").trim();
      if (!tag && !title) return null;
      return {
        id: item.id ?? index,
        tag,
        title,
        desc: item.desc ? String(item.desc) : undefined,
        image: item.image ? String(item.image) : undefined,
      };
    })
    .filter((item): item is ExpertiseItem => item !== null);
}

export type ApproachItem = {
  id?: number | string;
  phase?: string;
  title: string;
  desc: string;
  image?: string;
  createdAt?: number;
};

export function parseApproachItems(raw: unknown): ApproachItem[] {
  const value = parseSettingValue(raw);
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const title = String(item.title ?? "").trim();
      const desc = String(item.desc ?? "").trim();
      if (!title && !desc) return null;
      return {
        id: item.id ?? index,
        phase: item.phase ? String(item.phase) : undefined,
        title,
        desc,
        image: item.image ? String(item.image) : undefined,
        createdAt:
          typeof item.createdAt === "number"
            ? item.createdAt
            : typeof item.id === "number" && item.id > 1_000_000_000_000
              ? item.id
              : index,
      };
    })
    .filter((item): item is ApproachItem => item !== null);
}

/** Return the newest approach cards for the landing page (default: 4). */
export function getLatestApproachItems(raw: unknown, limit = 4): ApproachItem[] {
  return [...parseApproachItems(raw)]
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
    .slice(0, limit);
}

export type MethodologyItem = {
  id?: number | string;
  title: string;
  desc?: string;
  points?: string[];
  icon?: string;
  order?: number;
};

export type MethodologyStep = {
  id: string;
  title: string;
  points: string[];
  icon?: string;
};

/** Normalize bullet points for display (empty lines stripped). */
export function getMethodologyPoints(item: {
  points?: unknown;
  desc?: unknown;
}): string[] {
  if (Array.isArray(item.points)) {
    const fromArray = item.points
      .map((p) => String(p).trim())
      .filter(Boolean);
    if (fromArray.length > 0) return fromArray;
  }
  if (item.desc) {
    return String(item.desc)
      .split("\n")
      .map((line) => line.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
  }
  return [];
}

/** Bullet list for CMS editor — keeps empty rows so Add bullet works. */
export function getMethodologyEditorPoints(item: {
  points?: unknown;
  desc?: unknown;
}): string[] {
  if (Array.isArray(item.points)) {
    return item.points.length > 0
      ? item.points.map((p) => String(p))
      : [""];
  }
  const fromDesc = getMethodologyPoints(item);
  return fromDesc.length > 0 ? fromDesc : [""];
}

export function parseMethodologyItems(raw: unknown): MethodologyItem[] {
  const value = parseSettingValue(raw);
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;
      const title = String(item.title ?? "").trim();
      const desc = item.desc ? String(item.desc) : undefined;
      const points = getMethodologyPoints(item);
      if (!title && points.length === 0 && !desc) return null;
      return {
        id: item.id ?? index,
        title,
        desc: points.length > 0 ? points.join("\n") : desc,
        points,
        icon: item.icon ? String(item.icon) : undefined,
        order: typeof item.order === "number" ? item.order : index,
      };
    })
    .filter((item): item is MethodologyItem => item !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function toMethodologySteps(raw: unknown): MethodologyStep[] {
  return parseMethodologyItems(raw).map((item, index) => {
    const points = getMethodologyPoints(item);
    const stepNum = String(index + 1).padStart(2, "0");

    return {
      id: stepNum,
      title: item.title || `STEP ${stepNum}`,
      points,
      icon: item.icon,
    };
  });
}

export type AboutValueItem = {
  id?: number | string;
  text: string;
  text_id?: string;
  icon?: string;
  image?: string;
};

export function parseAboutValueItems(raw: unknown): AboutValueItem[] {
  const value = parseSettingValue(raw);
  if (!Array.isArray(value)) return [];

  const items: AboutValueItem[] = [];
  for (let index = 0; index < value.length; index++) {
    const item = value[index];
    if (!item || typeof item !== "object") continue;
    const text = String(item.text ?? "").trim();
    const text_id = item.text_id ? String(item.text_id).trim() : undefined;
    if (!text && !text_id) continue;
    items.push({
      id: item.id ?? index,
      text,
      ...(text_id ? { text_id } : {}),
      icon: item.icon ? String(item.icon) : undefined,
      image: item.image ? String(item.image) : undefined,
    });
  }
  return items;
}

export function parseHeroBanners(raw: unknown): HeroBanner[] {
  const value = parseSettingValue(raw);
  if (!Array.isArray(value) || value.length === 0) return [];

  return value
    .map((item, index) => {
      const src =
        typeof item === "string"
          ? item
          : (item?.image ?? item?.src ?? "");
      if (!src || typeof src !== "string") return null;
      return {
        src,
        alt:
          typeof item === "object" && item?.alt
            ? String(item.alt)
            : `Hero banner ${index + 1}`,
      };
    })
    .filter((b): b is HeroBanner => b !== null);
}
