import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Quiz } from "@/lib/models";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { question, options, correctAnswer } = await req.json();

    await connectToDatabase();

    const quiz = await Quiz.findById(resolvedParams.id).populate({
      path: "moduleId",
      populate: { path: "pathwayId" }
    });

    if (!quiz) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const pathwayUserId = (quiz.moduleId as any)?.pathwayId?.userId;

    if (!pathwayUserId || pathwayUserId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    quiz.question = question;
    quiz.options = options;
    quiz.correctAnswer = correctAnswer;
    await quiz.save();

    return NextResponse.json({ id: resolvedParams.id, question, options, correctAnswer });
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

    const quiz = await Quiz.findById(resolvedParams.id).populate({
      path: "moduleId",
      populate: { path: "pathwayId" }
    });

    if (!quiz) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const pathwayUserId = (quiz.moduleId as any)?.pathwayId?.userId;

    if (!pathwayUserId || pathwayUserId.toString() !== session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await Quiz.findByIdAndDelete(resolvedParams.id);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
