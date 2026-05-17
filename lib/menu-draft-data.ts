import { findPosts } from "@/lib/post-db-compat";
import { prisma } from "@/lib/prisma";
import { getAllSettings } from "@/lib/settings";
import {
  getLatestApproachItems,
  parseExpertiseItems,
  type ApproachItem,
  type ExpertiseItem,
} from "@/lib/settings-utils";
import type { PostType } from "@/app/generated/prisma";

export type MenuDraftPostRecord = {
  id: string;
  slug: string;
  title: string;
  title_id?: string | null;
  content: string;
  content_id?: string | null;
  category?: string | null;
  category_id?: string | null;
};

export type MenuDraftEventRecord = {
  id: string;
  title: string;
  title_id?: string | null;
  date: string;
  location: string;
  location_id?: string | null;
  link?: string | null;
};

export type MenuDraftJobRecord = {
  id: string;
  title: string;
  title_id?: string | null;
  description: string;
  description_id?: string | null;
};

async function fetchPublishedPosts(
  type: PostType,
  limit: number,
): Promise<MenuDraftPostRecord[]> {
  const rows = await findPosts({
    where: { status: "PUBLISHED", type },
    take: limit,
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    title_id: row.title_id ?? null,
    content: row.content,
    content_id: row.content_id ?? null,
    category: row.category ?? null,
    category_id: row.category_id ?? null,
  }));
}

export async function fetchMenuDraftEvents(limit = 6): Promise<MenuDraftEventRecord[]> {
  const rows = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      title_id: true,
      date: true,
      location: true,
      location_id: true,
      link: true,
    },
  });
  return rows;
}

export async function fetchMenuDraftJobs(limit = 3): Promise<MenuDraftJobRecord[]> {
  const rows = await prisma.jobPosting.findMany({
    where: { status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      title_id: true,
      description: true,
      description_id: true,
    },
  });
  return rows;
}

export type MenuDraftSettingsBundle = {
  settings: Record<string, unknown>;
  expertiseItems: ExpertiseItem[];
  approachItems: ApproachItem[];
};

export async function fetchMenuDraftSettingsBundle(): Promise<MenuDraftSettingsBundle> {
  let settings: Record<string, unknown> = {};
  try {
    settings = await getAllSettings();
  } catch {
    settings = {};
  }
  return {
    settings,
    expertiseItems: parseExpertiseItems(settings.expertise_items),
    approachItems: getLatestApproachItems(settings.approach_items, 6),
  };
}

export async function fetchExpertiseDraftData() {
  const bundle = await fetchMenuDraftSettingsBundle();
  return bundle;
}

export async function fetchWorkDraftData() {
  const bundle = await fetchMenuDraftSettingsBundle();
  return {
    settings: bundle.settings,
    approachItems: getLatestApproachItems(bundle.settings.approach_items, 4),
  };
}

export async function fetchKnowledgeCenterDraftData() {
  const [bundle, posts] = await Promise.all([
    fetchMenuDraftSettingsBundle(),
    fetchPublishedPosts("KNOWLEDGE", 6),
  ]);
  return { settings: bundle.settings, posts };
}

export async function fetchInsightsDraftData() {
  const [bundle, posts] = await Promise.all([
    fetchMenuDraftSettingsBundle(),
    fetchPublishedPosts("INSIGHT", 6),
  ]);
  return { settings: bundle.settings, posts };
}

export async function fetchEventsDraftData() {
  const [bundle, events] = await Promise.all([
    fetchMenuDraftSettingsBundle(),
    fetchMenuDraftEvents(6),
  ]);
  return { settings: bundle.settings, events };
}

export async function fetchCareerDraftData() {
  const [bundle, jobs] = await Promise.all([
    fetchMenuDraftSettingsBundle(),
    fetchMenuDraftJobs(3),
  ]);
  return { settings: bundle.settings, jobs };
}
