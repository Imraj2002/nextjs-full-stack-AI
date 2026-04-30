import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const pathway = await prisma.pathway.findUnique({
      where: { id: resolvedParams.id, userId: session.user.id },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    await prisma.$runCommandRaw({
      delete: "Pathway",
      deletes: [
        {
          q: { _id: { $oid: resolvedParams.id }, userId: { $oid: session.user.id } },
          limit: 1,
        },
      ],
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description } = await req.json();

    await prisma.$runCommandRaw({
      update: "Pathway",
      updates: [
        {
          q: { _id: { $oid: resolvedParams.id }, userId: { $oid: session.user.id } },
          u: { $set: { title, description } },
        },
      ],
    });

    return NextResponse.json({ id: resolvedParams.id, title, description });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
