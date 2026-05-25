"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import {
  DEFAULT_AI_MODEL,
  LEGACY_UNAVAILABLE_MODEL,
  generateLearningPathway,
} from "@/lib/ai";
import connectToDatabase from "@/lib/mongoose";
import { Module, Pathway, Quiz, Resource, User } from "@/lib/models";

type SignupInput = {
  name: string;
  email: string;
  password: string;
};

type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : T))
  | { ok: false; error: string };

type PathwayInput = {
  title?: string;
  goal?: string;
};

type ModuleInput = {
  pathwayId: string;
  title?: string;
  content?: string | null;
  order?: number;
};

type ResourceInput = {
  moduleId: string;
  title?: string;
  url?: string;
  type?: string;
};

type QuizInput = {
  moduleId: string;
  question?: string;
  options?: string;
  correctAnswer?: string;
};

type UserPreferencesInput = {
  aiApiKey?: string;
  aiModel?: string;
};

type ModuleUpdates = {
  title?: string;
  content?: string | null;
  order?: number;
};

function serialize(value: unknown): any {
  return JSON.parse(JSON.stringify(value));
}

async function requireUserId() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    throw new Error("Unauthorized");
  }

  return userId;
}

function revalidateLearningPaths(pathwayId?: string) {
  revalidatePath("/dashboard");
  if (pathwayId) {
    revalidatePath(`/pathway/${pathwayId}`);
  } else {
    revalidatePath("/pathway/[id]", "page");
  }
}

export async function signup(input: SignupInput): Promise<ActionResult> {
  try {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    const { password } = input;

    if (!name || !email || !password) {
      return { ok: false, error: "Please fill in all fields." };
    }

    if (password.length < 8) {
      return { ok: false, error: "Password must be at least 8 characters." };
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { ok: false, error: "This email is already registered. Please sign in instead." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });

    return { ok: true };
  } catch (error) {
    console.error("Signup failed:", error);
    return { ok: false, error: "Could not create your account. Please try again." };
  }
}

export async function getUserPreferences() {
  const userId = await requireUserId();

  await connectToDatabase();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const savedModel =
    user.aiModel && user.aiModel !== LEGACY_UNAVAILABLE_MODEL
      ? user.aiModel
      : DEFAULT_AI_MODEL;

  return {
    hasApiKey: !!user.aiApiKey,
    maskedKey: user.aiApiKey ? `sk-or-...${user.aiApiKey.slice(-4)}` : "",
    aiModel: savedModel,
  };
}

export async function saveUserPreferences(input: UserPreferencesInput) {
  const userId = await requireUserId();
  const { aiApiKey, aiModel } = input;

  await connectToDatabase();

  const existingUser = await User.findById(userId);

  let keyToSave = aiApiKey;
  if (keyToSave?.startsWith("sk-or-...")) {
    keyToSave = existingUser?.aiApiKey;
  }

  const modelToSave =
    aiModel && aiModel !== LEGACY_UNAVAILABLE_MODEL ? aiModel : DEFAULT_AI_MODEL;

  await User.findByIdAndUpdate(userId, {
    aiApiKey: keyToSave,
    aiModel: modelToSave,
  });

  return { success: true };
}

export async function generatePathway(goal: string): Promise<ActionResult<{ id: string }>> {
  try {
    const userId = await requireUserId();

    if (!goal || typeof goal !== "string") {
      return { ok: false, error: "Please enter a learning goal first." };
    }

    await connectToDatabase();

    const user = await User.findById(userId);
    let generatedData;

    try {
      generatedData = await generateLearningPathway(goal, user?.aiApiKey, user?.aiModel);
    } catch (error) {
      console.error("AI generation failed:", error);
      return {
        ok: false,
        error:
          "AI generation is unavailable right now. Your free model may be out of quota for today, or the selected model may be unavailable. Please try again later or choose another model in Advanced Settings.",
      };
    }

    const pathway = await Pathway.create({
      title: generatedData.title,
      description: generatedData.description,
      goal,
      userId,
    });

    for (const mod of generatedData.modules) {
      const createdModule = await Module.create({
        pathwayId: pathway._id,
        title: mod.title,
        content: mod.content,
        order: mod.order,
      });

      if (mod.resources?.length > 0) {
        await Resource.insertMany(
          mod.resources.map((res: any) => ({
            moduleId: createdModule._id,
            title: res.title,
            url: res.url,
            type: res.type,
          }))
        );
      }

      if (mod.quizzes?.length > 0) {
        await Quiz.insertMany(
          mod.quizzes.map((quiz: any) => ({
            moduleId: createdModule._id,
            question: quiz.question,
            options: JSON.stringify(quiz.options),
            correctAnswer: quiz.correctAnswer,
          }))
        );
      }
    }

    revalidateLearningPaths(pathway._id.toString());

    return { ok: true, id: pathway._id.toString() };
  } catch (error) {
    console.error("Pathway generation failed:", error);
    return {
      ok: false,
      error: "Could not generate the pathway. Please try again.",
    };
  }
}

export async function getPathways() {
  const userId = await requireUserId();

  await connectToDatabase();

  const pathways = await Pathway.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "modules",
      populate: [{ path: "resources" }, { path: "quizzes" }],
    });

  return serialize(pathways);
}

export async function createPathway(input: PathwayInput) {
  const userId = await requireUserId();
  const { title, goal } = input;

  await connectToDatabase();

  const newPathway = await Pathway.create({
    title: title || "New Pathway",
    goal: goal || "Learn something new",
    userId,
  });

  revalidateLearningPaths(newPathway._id.toString());

  return serialize({
    id: newPathway._id,
    title: newPathway.title,
    goal: newPathway.goal,
  });
}

export async function updatePathway(
  pathwayId: string,
  updates: { title?: string; description?: string | null }
) {
  const userId = await requireUserId();

  await connectToDatabase();

  const updated = await Pathway.findOneAndUpdate(
    { _id: pathwayId, userId },
    { title: updates.title, description: updates.description },
    { new: true }
  );

  if (!updated) {
    throw new Error("Pathway not found");
  }

  revalidateLearningPaths(pathwayId);

  return serialize({
    id: updated._id,
    title: updated.title,
    description: updated.description,
  });
}

export async function deletePathway(pathwayId: string) {
  const userId = await requireUserId();

  await connectToDatabase();

  const deleted = await Pathway.findOneAndDelete({ _id: pathwayId, userId });
  if (!deleted) {
    throw new Error("Pathway not found");
  }

  const modules = await Module.find({ pathwayId }).select("_id");
  const moduleIds = modules.map((mod) => mod._id);

  await Module.deleteMany({ pathwayId });
  await Resource.deleteMany({ moduleId: { $in: moduleIds } });
  await Quiz.deleteMany({ moduleId: { $in: moduleIds } });

  revalidateLearningPaths(pathwayId);

  return { success: true };
}

export async function createModule(input: ModuleInput) {
  const userId = await requireUserId();
  const { pathwayId, title, content, order } = input;

  await connectToDatabase();

  const pathway = await Pathway.findOne({ _id: pathwayId, userId });
  if (!pathway) {
    throw new Error("Pathway not found");
  }

  const newModule = await Module.create({
    pathwayId,
    title: title || "New Module",
    content: content || "",
    order: order || 1,
  });

  revalidateLearningPaths(pathwayId);

  return serialize({
    id: newModule._id,
    title: newModule.title,
    content: newModule.content,
    order: newModule.order,
    resources: [],
    quizzes: [],
  });
}

export async function updateModule(moduleId: string, updates: ModuleUpdates) {
  const userId = await requireUserId();

  await connectToDatabase();

  const mod = await Module.findById(moduleId).populate("pathwayId");
  if (!mod) {
    throw new Error("Module not found");
  }

  const pathway = mod.pathwayId as any;
  if (!pathway?.userId || pathway.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  if (updates.title !== undefined) mod.title = updates.title;
  if (updates.content !== undefined) mod.content = updates.content || undefined;
  if (updates.order !== undefined) mod.order = updates.order;

  await mod.save();
  revalidateLearningPaths(pathway._id.toString());

  return serialize({
    id: moduleId,
    title: mod.title,
    content: mod.content,
    order: mod.order,
  });
}

export async function deleteModule(moduleId: string) {
  const userId = await requireUserId();

  await connectToDatabase();

  const mod = await Module.findById(moduleId).populate("pathwayId");
  if (!mod) {
    throw new Error("Module not found");
  }

  const pathway = mod.pathwayId as any;
  if (!pathway?.userId || pathway.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await Module.findByIdAndDelete(moduleId);
  await Resource.deleteMany({ moduleId });
  await Quiz.deleteMany({ moduleId });

  revalidateLearningPaths(pathway._id.toString());

  return { success: true };
}

export async function createResource(input: ResourceInput) {
  const userId = await requireUserId();
  const { moduleId, title, url, type } = input;

  await connectToDatabase();

  const mod = await Module.findById(moduleId).populate("pathwayId");
  const pathway = mod?.pathwayId as any;
  if (!mod || !pathway?.userId || pathway.userId.toString() !== userId) {
    throw new Error("Module not found");
  }

  const newResource = await Resource.create({
    moduleId,
    title: title || "New Resource",
    url: url || "",
    type: type || "ARTICLE",
  });

  revalidateLearningPaths(pathway._id.toString());

  return serialize({
    id: newResource._id,
    title: newResource.title,
    url: newResource.url,
    type: newResource.type,
    moduleId,
  });
}

export async function deleteResource(resourceId: string) {
  const userId = await requireUserId();

  await connectToDatabase();

  const resource = await Resource.findById(resourceId).populate({
    path: "moduleId",
    populate: { path: "pathwayId" },
  });

  if (!resource) {
    throw new Error("Resource not found");
  }

  const pathway = (resource.moduleId as any)?.pathwayId;
  if (!pathway?.userId || pathway.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await Resource.findByIdAndDelete(resourceId);
  revalidateLearningPaths(pathway._id.toString());

  return { success: true };
}

export async function createQuiz(input: QuizInput) {
  const userId = await requireUserId();
  const { moduleId, question, options, correctAnswer } = input;

  await connectToDatabase();

  const mod = await Module.findById(moduleId).populate("pathwayId");
  const pathway = mod?.pathwayId as any;
  if (!mod || !pathway?.userId || pathway.userId.toString() !== userId) {
    throw new Error("Module not found");
  }

  const newQuiz = await Quiz.create({
    moduleId,
    question: question || "New Question?",
    options: options || JSON.stringify(["Option 1", "Option 2"]),
    correctAnswer: correctAnswer || "Option 1",
  });

  revalidateLearningPaths(pathway._id.toString());

  return serialize({
    id: newQuiz._id,
    moduleId,
    question: newQuiz.question,
    options: newQuiz.options,
    correctAnswer: newQuiz.correctAnswer,
  });
}

export async function deleteQuiz(quizId: string) {
  const userId = await requireUserId();

  await connectToDatabase();

  const quiz = await Quiz.findById(quizId).populate({
    path: "moduleId",
    populate: { path: "pathwayId" },
  });

  if (!quiz) {
    throw new Error("Quiz not found");
  }

  const pathway = (quiz.moduleId as any)?.pathwayId;
  if (!pathway?.userId || pathway.userId.toString() !== userId) {
    throw new Error("Unauthorized");
  }

  await Quiz.findByIdAndDelete(quizId);
  revalidateLearningPaths(pathway._id.toString());

  return { success: true };
}

export async function uploadFile(formData: FormData) {
  await requireUserId();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("No file uploaded");
  }

  const uniqueFilename = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
  const blob = await put(uniqueFilename, file, {
    access: "public",
  });

  return { url: blob.url };
}
