"use client";

import { useState, useRef } from "react";
import { Plus, Trash2, Save, BookOpen, Video, FileText, Upload } from "lucide-react";
import { useRouter } from "next/navigation";

type Resource = { id: string; title: string; url: string; type: string; moduleId: string };
type Quiz = { id: string; question: string; options: string; correctAnswer: string; moduleId: string };
type Module = { id: string; title: string; content: string | null; order: number; resources: Resource[]; quizzes: Quiz[] };
type Pathway = { id: string; title: string; description: string | null; goal: string; modules: Module[] };

export function PathwayBuilder({ initialPathway }: { initialPathway: Pathway }) {
  const [pathway, setPathway] = useState(initialPathway);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingModuleId, setUploadingModuleId] = useState<string | null>(null);

  const savePathwayTitleDesc = async () => {
    setIsSaving(true);
    await fetch(`/api/pathways/${pathway.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pathway.title, description: pathway.description }),
    });
    setIsSaving(false);
  };

  const addModule = async () => {
    const res = await fetch("/api/modules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pathwayId: pathway.id, title: "New Module", order: pathway.modules.length + 1 }),
    });
    const newMod = await res.json();
    setPathway({ ...pathway, modules: [...pathway.modules, { ...newMod, resources: [], quizzes: [] }] });
  };

  const updateModule = async (moduleId: string, updates: Partial<Module>) => {
    setPathway(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, ...updates } : m)
    }));
    await fetch(`/api/modules/${moduleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
  };

  const deleteModule = async (moduleId: string) => {
    setPathway(prev => ({ ...prev, modules: prev.modules.filter(m => m.id !== moduleId) }));
    await fetch(`/api/modules/${moduleId}`, { method: "DELETE" });
  };

  const addResource = async (moduleId: string, type: string, url: string, title: string) => {
    const res = await fetch("/api/resources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, title, url, type }),
    });
    const newRes = await res.json();
    setPathway(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, resources: [...m.resources, newRes] } : m)
    }));
  };

  const deleteResource = async (moduleId: string, resourceId: string) => {
    setPathway(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, resources: m.resources.filter(r => r.id !== resourceId) } : m)
    }));
    await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
  };

  const addQuiz = async (moduleId: string, question: string, options: string[], correctAnswer: string) => {
    const res = await fetch("/api/quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId, question, options: JSON.stringify(options), correctAnswer }),
    });
    const newQuiz = await res.json();
    setPathway(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, quizzes: [...m.quizzes, newQuiz] } : m)
    }));
  };

  const deleteQuiz = async (moduleId: string, quizId: string) => {
    setPathway(prev => ({
      ...prev,
      modules: prev.modules.map(m => m.id === moduleId ? { ...m, quizzes: m.quizzes.filter(q => q.id !== quizId) } : m)
    }));
    await fetch(`/api/quizzes/${quizId}`, { method: "DELETE" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !uploadingModuleId) return;
    const file = e.target.files[0];
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const { url } = await res.json();
      
      await addResource(uploadingModuleId, "FILE", url, file.name);
    } catch (err) {
      alert("Failed to upload file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploadingModuleId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

      {/* Pathway Header */}
      <div className="glass p-6 rounded-2xl border-white/10">
        <input 
          value={pathway.title}
          onChange={(e) => setPathway({ ...pathway, title: e.target.value })}
          onBlur={savePathwayTitleDesc}
          className="text-4xl font-bold text-white bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-500 focus:outline-none w-full mb-4"
          placeholder="Pathway Title"
        />
        <textarea
          value={pathway.description || ""}
          onChange={(e) => setPathway({ ...pathway, description: e.target.value })}
          onBlur={savePathwayTitleDesc}
          className="text-lg text-slate-400 bg-transparent border-b border-transparent hover:border-white/20 focus:border-blue-500 focus:outline-none w-full min-h-[100px] resize-none"
          placeholder="Add a description for this learning pathway..."
        />
      </div>

      {/* Modules */}
      <div className="space-y-6">
        {pathway.modules.map((mod, idx) => (
          <div key={mod.id} className="glass p-6 rounded-2xl border-white/10 relative group">
            <button 
              onClick={() => deleteModule(mod.id)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-lg">Module {idx + 1}</span>
              <input 
                value={mod.title}
                onChange={(e) => {
                  const newMods = [...pathway.modules];
                  newMods[idx].title = e.target.value;
                  setPathway({ ...pathway, modules: newMods });
                }}
                onBlur={() => updateModule(mod.id, { title: mod.title })}
                className="text-2xl font-bold text-white bg-transparent focus:outline-none w-full"
                placeholder="Module Title"
              />
            </div>

            <textarea
              value={mod.content || ""}
              onChange={(e) => {
                const newMods = [...pathway.modules];
                newMods[idx].content = e.target.value;
                setPathway({ ...pathway, modules: newMods });
              }}
              onBlur={() => updateModule(mod.id, { content: mod.content })}
              className="w-full text-slate-400 bg-black/20 rounded-xl p-4 border border-white/5 focus:outline-none focus:border-blue-500/50 min-h-[100px] resize-none mb-6"
              placeholder="Module content or lesson text..."
            />

            {/* Resources List */}
            <div className="space-y-3 mb-6">
              <h4 className="text-sm font-semibold uppercase text-slate-500">Resources</h4>
              {mod.resources.map(res => (
                <div key={res.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 group/res">
                  <div className="flex items-center gap-3">
                    {res.type === "FILE" ? <FileText className="w-4 h-4 text-green-400" /> : res.type === "VIDEO" ? <Video className="w-4 h-4 text-red-400" /> : <BookOpen className="w-4 h-4 text-blue-400" />}
                    <input 
                      value={res.title}
                      onChange={(e) => {
                        // Optimistic local update not fully implemented for resource titles, simple read-only display for now
                        // Ideally you'd have an edit mode for resources too
                      }}
                      className="bg-transparent text-sm text-slate-300 focus:outline-none"
                      readOnly
                    />
                    <a href={res.url} target="_blank" className="text-xs text-blue-400 hover:underline truncate max-w-[200px]">{res.url}</a>
                  </div>
                  <button onClick={() => deleteResource(mod.id, res.id)} className="text-slate-500 hover:text-red-400 opacity-0 group-hover/res:opacity-100 transition-opacity">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Resource Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const url = prompt("Enter URL (e.g. YouTube link or article):");
                  const title = prompt("Enter Resource Title:");
                  if (url && title) addResource(mod.id, "ARTICLE", url, title);
                }}
                className="text-xs font-semibold text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-3 h-3" /> Add Link
              </button>
              
              <button
                onClick={() => {
                  setUploadingModuleId(mod.id);
                  fileInputRef.current?.click();
                }}
                className="text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Upload className="w-3 h-3" /> Upload File (PDF/Image)
              </button>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={addModule}
        className="w-full py-6 border-2 border-dashed border-white/10 hover:border-blue-500/50 rounded-2xl text-slate-400 hover:text-blue-400 font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-5 h-5" /> Add New Module
      </button>

      <div className="flex justify-end pt-8">
        <button 
          onClick={() => router.push(`/pathway/${pathway.id}`)}
          className="aura-gradient px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-blue-500/25 transition-all"
        >
          Exit Edit Mode
        </button>
      </div>
    </div>
  );
}
