import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateLearningPathway } from "@/lib/ai";
import connectToDatabase from "@/lib/mongoose";
import { User, Pathway, Module, Resource, Quiz } from "@/lib/models";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { goal } = await req.json();
    if (!goal || typeof goal !== "string") {
      return new NextResponse("Invalid goal", { status: 400 });
    }

    await connectToDatabase();

    // Fetch user preferences for custom API key / model
    const user = await User.findById(session.user.id);

    // 1. Generate the pathway using AI
    const generatedData = await generateLearningPathway(goal, user?.aiApiKey, user?.aiModel);

    // 2. Save to Database using Mongoose
    const pathway = await Pathway.create({
      title: generatedData.title,
      description: generatedData.description,
      goal: goal,
      userId: session.user.id,
    });

    for (const mod of generatedData.modules) {
      const createdModule = await Module.create({
        pathwayId: pathway._id,
        title: mod.title,
        content: mod.content,
        order: mod.order
      });

      if (mod.resources?.length > 0) {
        const resourceDocs = mod.resources.map((res: any) => ({
          moduleId: createdModule._id,
          title: res.title,
          url: res.url,
          type: res.type
        }));
        await Resource.insertMany(resourceDocs);
      }

      if (mod.quizzes?.length > 0) {
        const quizDocs = mod.quizzes.map((quiz: any) => ({
          moduleId: createdModule._id,
          question: quiz.question,
          options: JSON.stringify(quiz.options),
          correctAnswer: quiz.correctAnswer
        }));
        await Quiz.insertMany(quizDocs);
      }
    }

    return NextResponse.json({ id: pathway._id });
  } catch (error) {
    console.error("[GENERATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
