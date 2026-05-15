import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(events);
  } catch (error: any) {
    console.error("Failed to fetch events:", error);
    return NextResponse.json({ message: "Error fetching events" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const event = await prisma.event.create({
      data: {
        title: data.title,
        date: data.date,
        location: data.location,
        image: data.image,
        category: data.category || "Conference",
        link: data.link || "#",
      },
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Failed to create event:", error);
    return NextResponse.json({ message: "Error creating event" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const { id, ...updateData } = data;
    const event = await prisma.event.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(event);
  } catch (error: any) {
    console.error("Failed to update event:", error);
    return NextResponse.json({ message: "Error updating event" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ message: "ID required" }, { status: 400 });

    await prisma.event.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Event deleted" });
  } catch (error: any) {
    console.error("Failed to delete event:", error);
    return NextResponse.json({ message: "Error deleting event" }, { status: 500 });
  }
}
