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

    const { title, url, type } = await req.json();

    const resource = await prisma.resource.findUnique({
      where: { id: resolvedParams.id },
      include: { module: { include: { pathway: true } } },
    });

    if (!resource || resource.module.pathway.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.$runCommandRaw({
      update: "Resource",
      updates: [
        {
          q: { _id: { $oid: resolvedParams.id } },
          u: { $set: { title, url, type } },
        },
      ],
    });

    return NextResponse.json({ id: resolvedParams.id, title, url, type });
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

    const resource = await prisma.resource.findUnique({
      where: { id: resolvedParams.id },
      include: { module: { include: { pathway: true } } },
    });

    if (!resource || resource.module.pathway.userId !== session.user.id) {
      return new NextResponse("Not Found / Unauthorized", { status: 404 });
    }

    await prisma.$runCommandRaw({
      delete: "Resource",
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
