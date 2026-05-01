import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Module, Pathway } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { pathwayId, title, content, order } = await req.json();

    await connectToDatabase();

    const pathway = await Pathway.findOne({ _id: pathwayId, userId: session.user.id });
    if (!pathway) return new NextResponse("Pathway Not Found", { status: 404 });

    const newModule = await Module.create({
      pathwayId,
      title: title || "New Module",
      content: content || "",
      order: order || 1,
    });

    return NextResponse.json({ 
      id: newModule._id, 
      title: newModule.title, 
      content: newModule.content, 
      order: newModule.order, 
      resources: [], 
      quizzes: [] 
    });
  } catch (error) {
    console.error("Error creating module:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
