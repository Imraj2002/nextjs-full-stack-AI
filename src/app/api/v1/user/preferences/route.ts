import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { aiApiKey: true, aiModel: true } as any,
    }) as any;

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Mask the API key before sending to client
    const maskedKey = user.aiApiKey
      ? `sk-or-...${user.aiApiKey.slice(-4)}`
      : "";

    return NextResponse.json({
      hasApiKey: !!user.aiApiKey,
      maskedKey,
      aiModel: user.aiModel || "",
    });
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { aiApiKey, aiModel } = await req.json();

    // Fetch existing user to get existing key if they send a masked key back
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    }) as any;

    let keyToSave = aiApiKey;
    if (keyToSave && keyToSave.startsWith("sk-or-...")) {
      // They didn't change it, keep existing
      keyToSave = existingUser?.aiApiKey;
    }

    // Safely update using raw command to bypass MongoDB transaction/replica set requirements
    await prisma.$runCommandRaw({
      update: "User",
      updates: [
        {
          q: { _id: { $oid: session.user.id } },
          u: { $set: { aiApiKey: keyToSave, aiModel: aiModel } },
        },
      ],
    });

    return NextResponse.json({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Error updating preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
