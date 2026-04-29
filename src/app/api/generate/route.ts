import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateLearningPathway } from "@/lib/ai";
import { prisma } from "@/lib/prisma";

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

    // 1. Generate the pathway using AI
    const generatedData = await generateLearningPathway(goal);

    // 2. Save to Database
    const pathway = await prisma.pathway.create({
      data: {
        title: generatedData.title,
        description: generatedData.description,
        goal: goal,
        userId: session.user.id,
        modules: {
          create: generatedData.modules.map((mod) => ({
            title: mod.title,
            content: mod.content,
            order: mod.order,
            resources: {
              create: mod.resources.map((res) => ({
                title: res.title,
                url: res.url,
                type: res.type,
              })),
            },
            quizzes: {
              create: mod.quizzes.map((quiz) => ({
                question: quiz.question,
                options: JSON.stringify(quiz.options),
                correctAnswer: quiz.correctAnswer,
              })),
            },
          })),
        },
      },
      include: {
        modules: {
          include: {
            resources: true,
            quizzes: true,
          },
        },
      },
    });

    return NextResponse.json(pathway);
  } catch (error) {
    console.error("[GENERATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
