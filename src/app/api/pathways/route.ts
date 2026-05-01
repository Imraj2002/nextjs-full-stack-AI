import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Pathway } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { title, goal } = await req.json();

    await connectToDatabase();

    const newPathway = await Pathway.create({
      title: title || "New Pathway",
      goal: goal || "Learn something new",
      userId: session.user.id,
    });

    return NextResponse.json({ id: newPathway._id, title: newPathway.title, goal: newPathway.goal });
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

    await connectToDatabase();

    const pathways = await Pathway.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .populate({
        path: "modules",
        populate: [
          { path: "resources" },
          { path: "quizzes" }
        ]
      });

    return NextResponse.json(pathways);
  } catch (error) {
    console.error("Error fetching pathways:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
