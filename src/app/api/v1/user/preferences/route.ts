import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongoose";
import { User } from "@/lib/models";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id);

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
      aiModel: user.aiModel || "google/gemma-3-27b-it:free",
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

    await connectToDatabase();

    // Fetch existing user to get existing key if they send a masked key back
    const existingUser = await User.findById(session.user.id);

    let keyToSave = aiApiKey;
    if (keyToSave && keyToSave.startsWith("sk-or-...")) {
      // They didn't change it, keep existing
      keyToSave = existingUser?.aiApiKey;
    }

    await User.findByIdAndUpdate(session.user.id, {
      aiApiKey: keyToSave,
      aiModel: aiModel,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
