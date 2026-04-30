import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { title, description, goal } = await req.json();

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    const generateObjectId = () => {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return timestamp + random;
    };
    
    const pathwayId = generateObjectId();
    const date = new Date();

    await prisma.$runCommandRaw({
      insert: "Pathway",
      documents: [{
        _id: { $oid: pathwayId },
        title,
        description: description || "",
        goal: goal || title,
        userId: { $oid: session.user.id },
        createdAt: { $date: date.toISOString() },
        updatedAt: { $date: date.toISOString() }
      }]
    });

    return NextResponse.json({ id: pathwayId });
  } catch (error) {
    console.error("Error creating pathway:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pathways = await prisma.pathway.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        goal: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(pathways);
  } catch (error) {
    console.error("Error fetching pathways:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
