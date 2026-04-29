import Link from "next/link";
import { Sparkles, BrainCircuit, Target, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="relative isolate">
      {/* Background Orbs */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
      </div>

      {/* Hero Section */}
      <div className="py-24 sm:py-32 lg:pb-40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-400 mb-8 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>New: Next.js 16 + Gemini 2.0 Integration</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-7xl mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              Personalized Learning, <br />
              <span className="text-blue-500">Illuminated by AI</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-400 max-w-2xl mx-auto">
              Aura transforms your goals into expert-crafted learning pathways.
              Structured modules, curated resources, and instant assessments, all generated in seconds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="aura-gradient px-8 py-4 rounded-xl text-lg font-semibold text-white shadow-lg shadow-blue-500/20 hover:scale-105 transition-transform flex items-center gap-2"
              >
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="#features" className="text-sm font-semibold leading-6 text-white hover:text-blue-400 transition-colors">
                Learn how it works <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl lg:text-center mb-16">
          <h2 className="text-base font-semibold leading-7 text-blue-500">Intelligent Design</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Everything you need to master any topic.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            <div className="flex flex-col glass p-8 rounded-3xl border-white/10">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                <BrainCircuit className="h-6 w-6 text-blue-500" aria-hidden="true" />
                AI Generation
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                <p className="flex-auto">Deep reasoning models analyze your goal to create a logically sequenced curriculum tailored to your level.</p>
              </dd>
            </div>
            <div className="flex flex-col glass p-8 rounded-3xl border-white/10">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                <Target className="h-6 w-6 text-purple-500" aria-hidden="true" />
                Actionable Steps
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                <p className="flex-auto">Every pathway is broken down into bite-sized modules with clear objectives and milestones.</p>
              </dd>
            </div>
            <div className="flex flex-col glass p-8 rounded-3xl border-white/10">
              <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                <Zap className="h-6 w-6 text-yellow-500" aria-hidden="true" />
                Instant Quizzes
              </dt>
              <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                <p className="flex-auto">Validate your knowledge with AI-generated assessments for every module to ensure true mastery.</p>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Decorative Orbs Bottom */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"></div>
      </div>
    </div>
  );
}
