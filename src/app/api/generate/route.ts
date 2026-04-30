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

    // Fetch user preferences for custom API key / model
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiApiKey: true, aiModel: true } as any,
    }) as any;

    // 1. Generate the pathway using AI
    const generatedData = await generateLearningPathway(goal, user?.aiApiKey, user?.aiModel);

    // 2. Save to Database using raw commands to bypass Replica Set requirements
    const generateObjectId = () => {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return timestamp + random;
    };

    const pathwayId = generateObjectId();
    const date = new Date().toISOString();

    await prisma.$runCommandRaw({
      insert: "Pathway",
      documents: [{
        _id: { $oid: pathwayId },
        title: generatedData.title,
        description: generatedData.description,
        goal: goal,
        userId: { $oid: session.user.id },
        createdAt: { $date: date },
        updatedAt: { $date: date }
      }]
    });

    for (const mod of generatedData.modules) {
      const moduleId = generateObjectId();
      await prisma.$runCommandRaw({
        insert: "Module",
        documents: [{
          _id: { $oid: moduleId },
          pathwayId: { $oid: pathwayId },
          title: mod.title,
          content: mod.content,
          order: mod.order
        }]
      });

      if (mod.resources?.length > 0) {
        await prisma.$runCommandRaw({
          insert: "Resource",
          documents: mod.resources.map((res: any) => ({
            _id: { $oid: generateObjectId() },
            moduleId: { $oid: moduleId },
            title: res.title,
            url: res.url,
            type: res.type
          }))
        });
      }

      if (mod.quizzes?.length > 0) {
        await prisma.$runCommandRaw({
          insert: "Quiz",
          documents: mod.quizzes.map((quiz: any) => ({
            _id: { $oid: generateObjectId() },
            moduleId: { $oid: moduleId },
            question: quiz.question,
            options: JSON.stringify(quiz.options),
            correctAnswer: quiz.correctAnswer
          }))
        });
      }
    }

    const pathway = { id: pathwayId };

    return NextResponse.json(pathway);
  } catch (error) {
    console.error("[GENERATION_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
