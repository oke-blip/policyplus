import { NextResponse } from "next/server";
import {
  findPostByIdentifier,
  isMissingColumnError,
  schemaOutOfDateMessage,
} from "@/lib/post-db-compat";
import type { PostStatus, PostType } from "@/app/generated/prisma";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as PostType | null;
    const isAdmin = searchParams.get("admin") === "true";

    const where: { status?: PostStatus; type?: PostType } = {};
    if (!isAdmin) {
      where.status = "PUBLISHED";
    }
    if (type) {
      where.type = type;
    }

    const post = await findPostByIdentifier({
      idOrSlug: decodeURIComponent(id),
      where,
    });

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 });
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    console.error("Failed to fetch post:", error);
    const message = isMissingColumnError(error)
      ? schemaOutOfDateMessage()
      : "Error fetching post";
    return NextResponse.json({ message }, { status: 500 });
  }
}
