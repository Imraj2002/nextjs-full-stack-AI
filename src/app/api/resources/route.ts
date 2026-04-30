import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { moduleId, title, url, type } = await req.json();

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
    
    const resourceId = generateObjectId();

    await prisma.$runCommandRaw({
      insert: "Resource",
      documents: [{
        _id: { $oid: resourceId },
        moduleId: { $oid: moduleId },
        title: title || "New Resource",
        url: url || "",
        type: type || "ARTICLE",
      }]
    });

    return NextResponse.json({ id: resourceId, title: title || "New Resource", url: url || "", type: type || "ARTICLE", moduleId });
  } catch (error) {
    console.error("Error creating resource:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
