import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Module, Resource, Quiz } from "@/lib/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const updates = await req.json();

    await connectToDatabase();

    const mod = await Module.findById(resolvedParams.id).populate("pathwayId");

    if (!mod) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Safety check for unpopulated or missing pathway
    const pathwayUserId = (mod.pathwayId as any)?.userId;
    
    if (!pathwayUserId || pathwayUserId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (updates.title !== undefined) mod.title = updates.title;
    if (updates.content !== undefined) mod.content = updates.content;
    if (updates.order !== undefined) mod.order = updates.order;
    
    await mod.save();

    return NextResponse.json({ id: resolvedParams.id, title: mod.title, content: mod.content, order: mod.order });
  } catch (error) {
    console.error("Error in PUT /api/modules/[id]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();

    const mod = await Module.findById(resolvedParams.id).populate("pathwayId");

    if (!mod) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const pathwayUserId = (mod.pathwayId as any)?.userId;

    if (!pathwayUserId || pathwayUserId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Module.findByIdAndDelete(resolvedParams.id);
    
    // Optionally delete cascading resources/quizzes
    await Resource.deleteMany({ moduleId: resolvedParams.id });
    await Quiz.deleteMany({ moduleId: resolvedParams.id });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error in DELETE /api/modules/[id]:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
