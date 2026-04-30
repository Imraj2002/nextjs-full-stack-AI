import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { moduleId, question, options, correctAnswer } = await req.json();

    // Verify ownership
    const mod = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { pathway: true },
    });
    if (!mod || mod.pathway.userId !== session.user.id) {
      return new NextResponse("Module Not Found / Unauthorized", { status: 404 });
    }

    const generateObjectId = () => {
      const timestamp = Math.floor(Date.now() / 1000).toString(16);
      const random = Array.from({length: 16}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      return timestamp + random;
    };
    
    const quizId = generateObjectId();

    await prisma.$runCommandRaw({
      insert: "Quiz",
      documents: [{
        _id: { $oid: quizId },
        moduleId: { $oid: moduleId },
        question: question || "New Question?",
        options: options || JSON.stringify(["Option 1", "Option 2"]),
        correctAnswer: correctAnswer || "Option 1",
      }]
    });

    return NextResponse.json({ id: quizId, moduleId, question, options, correctAnswer });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
