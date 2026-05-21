"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2, Target, Settings2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  createPathway,
  generatePathway,
  getUserPreferences,
  saveUserPreferences,
} from "@/app/actions";

export function GenerationForm() {
  const [goal, setGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("");
  const [isSavingPref, setIsSavingPref] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getUserPreferences()
      .then((data) => {
        if (data.maskedKey) setApiKey(data.maskedKey);
        if (data.aiModel) setModel(data.aiModel);
      })
      .catch(console.error);
  }, []);

  const handleSavePreferences = async () => {
    setIsSavingPref(true);
    try {
      await saveUserPreferences({ aiApiKey: apiKey, aiModel: model });
      alert("Preferences saved successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save preferences.");
    } finally {
      setIsSavingPref(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;

    setIsLoading(true);
    try {
      const data = await generatePathway(goal);
      router.push(`/pathway/${data.id}`);
      router.refresh();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please check your API key and model.";
      alert(message);
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
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              Create New Pathway
              <Sparkles className="w-5 h-5 text-blue-400" />
            </h2>
            <p className="text-slate-400 text-sm">
              Describe what you want to learn. Be specific for better results.
            </p>
          </div>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Advanced Settings"
          >
            <Settings2 className="w-5 h-5" />
          </button>
        </div>

        {showSettings && (
          <div className="mb-6 p-4 rounded-2xl bg-black/20 border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Advanced Settings</h3>
            <p className="text-xs text-slate-400">Add your own OpenRouter credentials to bypass rate limits.</p>
            
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 ml-1">OpenRouter API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-v1-..."
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 ml-1">Model ID</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g., google/gemini-2.5-flash"
                  className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={isSavingPref}
                className="w-full py-2 bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isSavingPref ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Preferences
              </button>
            </div>
          </div>
        )}

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
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading || !goal.trim()}
              className="flex-1 aura-gradient py-4 rounded-2xl font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
            <button
              type="button"
              onClick={async () => {
                if (!goal.trim()) {
                  alert("Please enter a title/goal first.");
                  return;
                }
                setIsLoading(true);
                try {
                  const data = await createPathway({ title: goal, goal });
                  router.push(`/pathway/${data.id}?edit=true`);
                } catch (e) {
                  alert("Failed to create pathway");
                } finally {
                  setIsLoading(false);
                }
              }}
              disabled={isLoading || !goal.trim()}
              className="px-6 py-4 rounded-2xl font-semibold text-white bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              Create Manually
            </button>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-sm text-slate-300">
            <p className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">💡</span>
              <span>
                <strong>Tip:</strong> If the AI generation fails due to API limits, you can click <strong>Create Manually</strong> to bypass the AI and build your own course from scratch. 
                You can also click the gear icon above to provide your own Custom API Key and Model to bypass the free tier limits!
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
