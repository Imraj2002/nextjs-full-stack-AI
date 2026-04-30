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

    const { title, content, order } = await req.json();

    // The module must belong to a pathway owned by the user
    const mod = await prisma.module.findUnique({
      where: { id: resolvedParams.id },
      include: { pathway: true },
    });

    if (!mod || mod.pathway.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.$runCommandRaw({
      update: "Module",
      updates: [
        {
          q: { _id: { $oid: resolvedParams.id } },
          u: { $set: { title, content, order } },
        },
      ],
    });

    return NextResponse.json({ id: resolvedParams.id, title, content, order });
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

    const mod = await prisma.module.findUnique({
      where: { id: resolvedParams.id },
      include: { pathway: true },
    });

    if (!mod || mod.pathway.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.$runCommandRaw({
      delete: "Module",
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
