import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/lib/auth";
import { getPathwaysForUser } from "@/lib/data";
import { GenerationForm } from "@/components/generation-form";
import { DashboardClient } from "@/components/dashboard-client";

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-slate-400">
          Loading dashboard...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

async function DashboardContent() {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const pathways = await getPathwaysForUser(userId);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <GenerationForm />
        </div>
        <DashboardClient initialPathways={pathways} />
      </div>
    </div>
  );
}
