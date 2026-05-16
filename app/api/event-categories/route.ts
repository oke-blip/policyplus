import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function slugify(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function GET() {
  try {
    const categories = await prisma.eventCategory.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(categories);
  } catch (error: unknown) {
    console.error("Failed to fetch event categories:", error);
    return NextResponse.json({ message: "Error fetching event categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const category = await prisma.eventCategory.create({
      data: {
        name: data.name,
        name_id: data.name_id?.trim() || null,
        slug: data.slug || slugify(data.name),
      },
    });
    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("Failed to create event category:", error);
    return NextResponse.json({ message: "Error creating event category" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, name, slug } = data;
    const category = await prisma.eventCategory.update({
      where: { id },
      data: {
        name,
        name_id:
          data.name_id === undefined ? undefined : data.name_id?.trim() || null,
        slug: slug || slugify(name),
      },
    });
    return NextResponse.json(category);
  } catch (error: unknown) {
    console.error("Failed to update event category:", error);
    return NextResponse.json({ message: "Error updating event category" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.eventCategory.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Category deleted" });
  } catch (error: unknown) {
    console.error("Failed to delete event category:", error);
    return NextResponse.json({ message: "Error deleting event category" }, { status: 500 });
  }
}
