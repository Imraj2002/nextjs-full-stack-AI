"use client";

import { useState } from "react";
import { Sparkles, Loader2, Target } from "lucide-react";
import { useRouter } from "next/navigation";

export function GenerationForm() {
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal }),
      });

      if (!response.ok) throw new Error("Failed to generate");

      const data = await response.json();
      router.push(`/pathway/${data.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please check your API keys and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass p-8 rounded-3xl border-white/10 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Target className="w-24 h-24 text-white" />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          Create New Pathway
          <Sparkles className="w-5 h-5 text-blue-400" />
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Describe what you want to learn. Be specific for better results.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Master Advanced React Design Patterns and Performance Optimization..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all min-h-[120px] resize-none"
              disabled={isLoading}
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading || !goal.trim()}
            className="w-full aura-gradient py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Curriculum...
              </>
            ) : (
              <>
                Generate Pathway
                <Sparkles className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
