import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const pathway = await prisma.pathway.findUnique({
      where: { id: params.id, userId: session.user.id },
      include: { modules: { include: { resources: true, quizzes: true } } },
    });

    if (!pathway) return new NextResponse("Not Found", { status: 404 });

    return NextResponse.json(pathway);
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    await prisma.pathway.delete({
      where: { id: params.id, userId: session.user.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
