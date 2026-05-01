"use client";

import { GenerationForm } from "@/components/generation-form";
import Link from "next/link";
import { ChevronRight, Calendar, BookOpen, Trash2, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState, useEffect } from "react";

interface Pathway {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  modules?: any[];
}

export default function DashboardPageWrapper() {
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pathways")
      .then((res) => res.json())
      .then((data) => {
        setPathways(data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3">
          <GenerationForm />
        </div>
        <div className="md:w-2/3">
          <h1 className="text-3xl font-bold text-white mb-8">My Pathways</h1>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : pathways.length === 0 ? (
            <div className="glass p-12 rounded-3xl border-white/10 text-center">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">You haven&apos;t created any pathways yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {pathways.map((pathway) => (
                <PathwayCard 
                  key={pathway.id} 
                  pathway={pathway} 
                  onDelete={() => setPathways(prev => prev.filter(p => p.id !== pathway.id))} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PathwayCard({ pathway, onDelete }: { pathway: Pathway, onDelete: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this pathway?")) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/pathways/${pathway.id}`, { method: "DELETE" });
      if (res.ok) onDelete();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link
      href={`/pathway/${pathway.id}`}
      className="glass p-6 rounded-3xl border-white/10 hover:border-blue-500/30 transition-all group relative overflow-hidden flex items-center justify-between"
    >
      <div className="flex-1">
        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
          {pathway.title}
        </h3>
        <p className="text-slate-400 text-sm mt-1 line-clamp-2 max-w-xl">
          {pathway.description}
        </p>
        <div className="flex gap-4 mt-6">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-white/5 px-2.5 py-1 rounded-full">
            <BookOpen className="w-3 h-3" />
            {pathway.modules ? pathway.modules.length : 0} Modules
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-white/5 px-2.5 py-1 rounded-full">
            <Calendar className="w-3 h-3" />
            {formatDistanceToNow(new Date(pathway.createdAt), { addSuffix: true })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 rounded-xl bg-white/5 text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
        >
          {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
        </button>
        <ChevronRight className="w-6 h-6 text-slate-600 group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
      </div>
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-600 to-purple-600 w-[15%]" />
    </Link>
  );
}
