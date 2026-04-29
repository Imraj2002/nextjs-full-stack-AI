import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pathways = await prisma.pathway.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pathways);
  } catch (error) {
    console.error("[FETCH_PATHWAYS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
