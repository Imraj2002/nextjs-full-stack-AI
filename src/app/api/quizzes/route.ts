import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { Quiz, Module } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { moduleId, question, options, correctAnswer } = await req.json();

    await connectToDatabase();

    // Verify ownership
    const mod = await Module.findById(moduleId).populate("pathwayId");
    
    if (!mod || mod.pathwayId.userId.toString() !== session.user.id) {
      return new NextResponse("Module Not Found / Unauthorized", { status: 404 });
    }

    const newQuiz = await Quiz.create({
      moduleId,
      question: question || "New Question?",
      options: options || JSON.stringify(["Option 1", "Option 2"]),
      correctAnswer: correctAnswer || "Option 1",
    });

    return NextResponse.json({ 
      id: newQuiz._id, 
      moduleId, 
      question: newQuiz.question, 
      options: newQuiz.options, 
      correctAnswer: newQuiz.correctAnswer 
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
