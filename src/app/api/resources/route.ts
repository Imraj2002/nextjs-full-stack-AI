import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Resource, Module } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { moduleId, title, url, type } = await req.json();

    await connectToDatabase();

    const mod = await Module.findById(moduleId).populate("pathwayId");
    if (!mod || mod.pathwayId.userId.toString() !== session.user.id) {
      return new NextResponse("Module Not Found / Unauthorized", { status: 404 });
    }

    const newResource = await Resource.create({
      moduleId,
      title: title || "New Resource",
      url: url || "",
      type: type || "ARTICLE",
    });

    return NextResponse.json({ 
      id: newResource._id, 
      title: newResource.title, 
      url: newResource.url, 
      type: newResource.type, 
      moduleId 
    });
  } catch (error) {
    console.error("Error creating resource:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
