import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BookOpen, CheckCircle2, PlayCircle, ExternalLink, HelpCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { PathwayBuilder } from "@/components/pathway-builder";

export default async function PathwayDetailPage({ 
  params,
  searchParams 
}: { 
  params: Promise<{ id: string }>,
  searchParams: Promise<{ edit?: string }>
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const session = await auth();
  if (!session) redirect("/login");

  const pathway = await prisma.pathway.findUnique({
    where: { id: resolvedParams.id, userId: session.user?.id },
    include: {
      modules: {
        orderBy: { order: "asc" },
        include: {
          resources: true,
          quizzes: true,
        },
      },
    },
  });

  if (!pathway) notFound();

  const isOwner = pathway.userId === session.user.id;
  const isEditing = resolvedSearchParams.edit === "true" && isOwner;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Dashboard
        </Link>
        {!isEditing && isOwner && (
          <Link
            href={`/pathway/${pathway.id}?edit=true`}
            className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium transition-colors"
          >
            Edit Pathway
          </Link>
        )}
      </div>

      {isEditing ? (
        <PathwayBuilder initialPathway={pathway as any} />
      ) : (
        <>
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
          {pathway.title}
        </h1>
        <p className="text-lg text-slate-400 max-w-3xl leading-relaxed">
          {pathway.description}
        </p>
      </div>

      <div className="space-y-12 relative">
        {/* Connection Line */}
        <div className="absolute left-6 top-8 bottom-8 w-[2px] bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-transparent -z-10" />

        {pathway.modules.map((module, idx) => (
          <div key={module.id} className="relative pl-16">
            {/* Module Dot */}
            <div className="absolute left-0 top-0 w-12 h-12 rounded-full glass border border-white/10 flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
              <span className="text-blue-400 font-bold">{idx + 1}</span>
            </div>

            <div className="glass p-8 rounded-3xl border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                {module.title}
                <CheckCircle2 className="w-5 h-5 text-slate-600" />
              </h3>

              <div className="prose prose-invert max-w-none text-slate-400 mb-8 leading-relaxed">
                {module.content}
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Resources */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Learning Resources
                  </h4>
                  <div className="space-y-3">
                    {module.resources.map((res) => (
                      <a
                        key={res.id}
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          {res.type === "VIDEO" ? (
                            <PlayCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-blue-400" />
                          )}
                          <span className="text-sm font-medium text-slate-300">{res.title}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Quizzes */}
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    Knowledge Check
                  </h4>
                  <div className="space-y-4">
                    {module.quizzes.map((quiz) => (
                      <div key={quiz.id} className="p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-sm font-medium text-white mb-3">{quiz.question}</p>
                        <div className="grid gap-2">
                          {JSON.parse(quiz.options).map((opt: string, i: number) => (
                            <button
                              key={i}
                              className="text-left text-xs p-2.5 rounded-lg bg-white/5 hover:bg-blue-500/10 border border-white/5 hover:border-blue-500/20 text-slate-400 hover:text-blue-400 transition-all"
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        </div>
        </>
      )}
    </div>
  );
}
