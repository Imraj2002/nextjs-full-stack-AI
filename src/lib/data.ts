import { cacheLife, cacheTag } from "next/cache";
import connectToDatabase from "@/lib/mongoose";
import { Pathway } from "@/lib/models";

export type DashboardPathway = {
  id: string;
  title: string;
  description?: string | null;
  createdAt: string;
  modules?: unknown[];
};

export function pathwaysTag(userId: string) {
  return `pathways:${userId}`;
}

export function pathwayTag(userId: string, pathwayId: string) {
  return `pathway:${userId}:${pathwayId}`;
}

function serialize(value: unknown): any {
  return JSON.parse(JSON.stringify(value));
}

export async function getPathwaysForUser(userId: string): Promise<DashboardPathway[]> {
  "use cache";

  cacheLife("minutes");
  cacheTag(pathwaysTag(userId));

  await connectToDatabase();

  const pathways = await Pathway.find({ userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "modules",
      populate: [{ path: "resources" }, { path: "quizzes" }],
    });

  return serialize(pathways);
}

export async function getPathwayForUser(userId: string, pathwayId: string) {
  "use cache";

  cacheLife("minutes");
  cacheTag(pathwayTag(userId, pathwayId));

  await connectToDatabase();

  const pathway = await Pathway.findOne({ _id: pathwayId, userId }).populate({
    path: "modules",
    populate: [{ path: "resources" }, { path: "quizzes" }],
  });

  return pathway ? serialize(pathway) : null;
}
