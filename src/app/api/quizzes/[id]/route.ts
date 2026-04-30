import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { question, options, correctAnswer } = await req.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: resolvedParams.id },
      include: { module: { include: { pathway: true } } },
    });

    if (!quiz || quiz.module.pathway.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.$runCommandRaw({
      update: "Quiz",
      updates: [
        {
          q: { _id: { $oid: resolvedParams.id } },
          u: { $set: { question, options, correctAnswer } },
        },
      ],
    });

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

    const quiz = await prisma.quiz.findUnique({
      where: { id: resolvedParams.id },
      include: { module: { include: { pathway: true } } },
    });

    if (!quiz || quiz.module.pathway.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.$runCommandRaw({
      delete: "Quiz",
      deletes: [
        {
          q: { _id: { $oid: resolvedParams.id } },
          limit: 1,
        },
      ],
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
