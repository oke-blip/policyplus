import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const type = searchParams.get("type") as any;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const where: any = { status: "PUBLISHED" as any };
    if (category && category !== "All") where.category = category;
    if (type) where.type = type;
    
    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return NextResponse.json(posts);
  } catch (error: any) {
    console.error("Failed to fetch posts:", error);
    return NextResponse.json({ message: "Error fetching posts" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const post = await prisma.post.create({
      data: {
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "") + "-" + Date.now(),
        content: data.content,
        image_url: data.image_url,
        status: data.status || "PUBLISHED",
        type: data.type || "INSIGHT",
        category: data.category,
        author_name: data.author_name,
        author_image: data.author_image,
      },
    });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Failed to create post:", error);
    return NextResponse.json({ message: "Error creating post" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const post = await prisma.post.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(post);
  } catch (error: any) {
    console.error("Failed to update post:", error);
    return NextResponse.json({ message: "Error updating post" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.post.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Post deleted" });
  } catch (error: any) {
    console.error("Failed to delete post:", error);
    return NextResponse.json({ message: "Error deleting post" }, { status: 500 });
  }
}
