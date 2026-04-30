import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pathwayId, title, content, order } = await req.json();

    // Verify ownership
    const pathway = await prisma.pathway.findUnique({
      where: { id: pathwayId, userId: session.user.id },
    });
    if (!pathway) return new NextResponse("Pathway Not Found", { status: 404 });

    const generateObjectId = () => {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return timestamp + random;
    };
    
    const moduleId = generateObjectId();

    await prisma.$runCommandRaw({
      insert: "Module",
      documents: [{
        _id: { $oid: moduleId },
        pathwayId: { $oid: pathwayId },
        title: title || "New Module",
        content: content || "",
        order: order || 1,
      }]
    });

    return NextResponse.json({ id: moduleId, title: title || "New Module", content: content || "", order: order || 1, resources: [], quizzes: [] });
  } catch (error) {
    console.error("Error creating module:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
