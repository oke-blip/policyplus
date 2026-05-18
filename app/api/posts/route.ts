import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  createPost,
  findPosts,
  isMissingColumnError,
  schemaOutOfDateMessage,
  updatePost,
} from "@/lib/post-db-compat";
import {
  collectPostImageUrls,
  deleteStorageObjectsByUrls,
  isDataUrl,
} from "@/lib/supabase-storage";
import type { PostStatus, PostType } from "@/app/generated/prisma";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function rejectBase64Images(data: Record<string, unknown>): string | null {
  for (const field of ["image_url", "author_image"] as const) {
    const value = data[field];
    if (typeof value === "string" && isDataUrl(value)) {
      return "Images must be uploaded to storage, not embedded as base64.";
    }
  }
  return null;
}

function optionalString(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s || null;
}

function buildPostData(data: Record<string, unknown>) {
  return {
    title: data.title as string,
    title_id: optionalString(data.title_id),
    content: data.content as string,
    content_id: optionalString(data.content_id),
    image_url: (data.image_url as string) || null,
    status: (data.status as PostStatus) || "PUBLISHED",
    type: (data.type as PostType) || "INSIGHT",
    category: (data.category as string) || null,
    category_id: optionalString(data.category_id),
    author_name: (data.author_name as string) || null,
    author_name_id: optionalString(data.author_name_id),
    author_role: (data.author_role as string) || null,
    author_role_id: optionalString(data.author_role_id),
    author_bio: (data.author_bio as string) || null,
    author_bio_id: optionalString(data.author_bio_id),
    author_image: (data.author_image as string) || null,
    tags: (data.tags as string) || null,
    tags_id: optionalString(data.tags_id),
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type") as PostType | null;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!, 10)
      : undefined;
    const isAdmin = searchParams.get("admin") === "true";

    const where: {
      status?: PostStatus;
      category?: string;
      type?: PostType;
    } = {};

    if (!isAdmin) {
      where.status = "PUBLISHED";
    }
    if (category && category !== "All") {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }

    const posts = await findPosts({
      where,
      take: limit,
    });
    return NextResponse.json(posts);
  } catch (error: unknown) {
    console.error("Failed to fetch posts:", error);
    const message = isMissingColumnError(error)
      ? schemaOutOfDateMessage()
      : "Error fetching posts";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const imageError = rejectBase64Images(data);
    if (imageError) {
      return NextResponse.json({ message: imageError }, { status: 400 });
    }
    const postData = buildPostData(data);
    const baseSlug =
      (data.slug as string) ||
      slugify(postData.title) + "-" + Date.now();

    const post = await createPost({
      ...postData,
      slug: baseSlug,
    });
    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("Failed to create post:", error);
    const message = isMissingColumnError(error)
      ? schemaOutOfDateMessage()
      : "Error creating post";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id } = data;
    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const imageError = rejectBase64Images(data);
    if (imageError) {
      return NextResponse.json({ message: imageError }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    const postData = buildPostData(data);
    if (existing) {
      const replaced: string[] = [];
      const nextUrls = collectPostImageUrls(postData);
      const nextSet = new Set(nextUrls);
      for (const url of collectPostImageUrls(existing)) {
        if (!nextSet.has(url)) replaced.push(url);
      }
      await deleteStorageObjectsByUrls(replaced);
    }

    const post = await updatePost(id, postData);
    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("Failed to update post:", error);
    const message = isMissingColumnError(error)
      ? schemaOutOfDateMessage()
      : "Error updating post";
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const existing = await prisma.post.findUnique({ where: { id } });
    if (existing) {
      await deleteStorageObjectsByUrls(collectPostImageUrls(existing));
    }

    await prisma.post.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Post deleted" });
  } catch (error: unknown) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ message: "Error deleting post" }, { status: 500 });
  }
}
