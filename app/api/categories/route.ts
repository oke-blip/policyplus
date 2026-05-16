import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "P2002"
  );
}

async function findCategoryConflict(
  name: string,
  slug: string,
  excludeId?: string,
) {
  const trimmedName = name.trim();
  const categories = await prisma.knowledgeCategory.findMany({
    where: excludeId ? { NOT: { id: excludeId } } : undefined,
    select: { id: true, name: true, slug: true },
  });

  return categories.find(
    (cat) =>
      cat.slug.toLowerCase() === slug.toLowerCase() ||
      cat.name.toLowerCase() === trimmedName.toLowerCase(),
  );
}

export async function GET() {
  try {
    const categories = await prisma.knowledgeCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("Failed to fetch categories:", error);
    return NextResponse.json({ message: "Error fetching categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const name = (data.name as string)?.trim();
    if (!name) {
      return NextResponse.json({ message: "Category name is required." }, { status: 400 });
    }

    const slug = ((data.slug as string) || slugify(name)).trim();
    if (!slug) {
      return NextResponse.json({ message: "Category slug is required." }, { status: 400 });
    }

    const conflict = await findCategoryConflict(name, slug);
    if (conflict) {
      return NextResponse.json(
        {
          message: `A category with this name or slug already exists ("${conflict.name}").`,
        },
        { status: 409 },
      );
    }

    const category = await prisma.knowledgeCategory.create({
      data: {
        name,
        name_id: (data.name_id as string)?.trim() || null,
        slug,
      },
    });
    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("Failed to create category:", error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { message: "A category with this name or slug already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "Error creating category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name } = data;
    if (!id || !name?.trim()) {
      return NextResponse.json(
        { message: "Category ID and name are required." },
        { status: 400 },
      );
    }

    const trimmedName = name.trim();
    const existing = await prisma.knowledgeCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    const newSlug = ((data.slug as string) || slugify(trimmedName)).trim();
    if (!newSlug) {
      return NextResponse.json({ message: "Category slug is required." }, { status: 400 });
    }

    const conflict = await findCategoryConflict(trimmedName, newSlug, id);
    if (conflict) {
      return NextResponse.json(
        {
          message: `A category with this name or slug already exists ("${conflict.name}").`,
        },
        { status: 409 },
      );
    }

    const category = await prisma.$transaction(async (tx) => {
      if (existing.name !== trimmedName) {
        await tx.post.updateMany({
          where: { category: existing.name },
          data: { category: trimmedName },
        });
      }
      return tx.knowledgeCategory.update({
        where: { id },
        data: {
          name: trimmedName,
          name_id:
            data.name_id === undefined
              ? undefined
              : (data.name_id as string)?.trim() || null,
          slug: newSlug,
        },
      });
    });

    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("Failed to update category:", error);
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { message: "A category with this name or slug already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ message: "Error updating category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ message: "ID required" }, { status: 400 });
    }

    const existing = await prisma.knowledgeCategory.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.post.updateMany({
        where: { category: existing.name },
        data: { category: null },
      });
      await tx.knowledgeCategory.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "Category deleted" });
  } catch (error: unknown) {
    console.error("Failed to delete category:", error);
    return NextResponse.json({ message: "Error deleting category" }, { status: 500 });
  }
}
