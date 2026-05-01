import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Pathway, Module } from "@/lib/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    await connectToDatabase();

    const pathway = await Pathway.findOne({ _id: resolvedParams.id, userId: session.user.id })
      .populate({
        path: "modules",
        populate: [
          { path: "resources" },
          { path: "quizzes" }
        ]
      });

    if (!pathway) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(pathway);
  } catch (error) {
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

    const deleted = await Pathway.findOneAndDelete({ _id: resolvedParams.id, userId: session.user.id });
    
    if (!deleted) return new NextResponse("Not Found", { status: 404 });

    // Optionally delete cascading modules/resources here if needed
    await Module.deleteMany({ pathwayId: resolvedParams.id });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description } = await req.json();

    await connectToDatabase();

    const updated = await Pathway.findOneAndUpdate(
      { _id: resolvedParams.id, userId: session.user.id },
      { title, description },
      { new: true }
    );

    if (!updated) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json({ id: updated._id, title: updated.title, description: updated.description });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
