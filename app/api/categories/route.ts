import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.knowledgeCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const category = await prisma.knowledgeCategory.create({
      data: {
        name: data.name,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      },
    });
    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Failed to create category:", error);
    return NextResponse.json({ message: "Error creating category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, slug } = data;
    const category = await prisma.knowledgeCategory.update({
      where: { id },
      data: {
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      },
    });
    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Failed to update category:", error);
    return NextResponse.json({ message: "Error updating category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.knowledgeCategory.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error: any) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
  }
}
