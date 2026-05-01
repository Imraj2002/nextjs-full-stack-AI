import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Resource } from "@/lib/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { title, url, type } = await req.json();

    await connectToDatabase();

    const resource = await Resource.findById(resolvedParams.id).populate({
      path: "moduleId",
      populate: { path: "pathwayId" }
    });

    if (!resource) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const pathwayUserId = resource.moduleId?.pathwayId?.userId;

    if (!pathwayUserId || pathwayUserId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    resource.title = title;
    resource.url = url;
    resource.type = type;
    await resource.save();

    return NextResponse.json({ id: resolvedParams.id, title, url, type });
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

    const resource = await Resource.findById(resolvedParams.id).populate({
      path: "moduleId",
      populate: { path: "pathwayId" }
    });

    if (!resource) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const pathwayUserId = resource.moduleId?.pathwayId?.userId;

    if (!pathwayUserId || pathwayUserId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Resource.findByIdAndDelete(resolvedParams.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
