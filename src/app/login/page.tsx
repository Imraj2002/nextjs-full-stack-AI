"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { Sparkles, Mail, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const registered = searchParams.get("registered");
  const authError = searchParams.get("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    setLoading(false);

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="glass p-12 rounded-[40px] border-white/10 text-center relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-full aura-gradient opacity-5 -z-10" />
          
          <div className="p-4 aura-gradient rounded-3xl w-16 h-16 mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Aura</h1>
          <p className="text-slate-400 mb-8 text-sm">
            Sign in to illuminate your learning journey.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {registered && (
              <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm text-center">
                Account created! Please sign in.
              </div>
            )}
            
            {(error || authError) && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                {error || "Authentication failed"}
              </div>
            )}
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-400 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-2 bg-white text-black rounded-2xl font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-400">
            Don't have an account?{" "}
            <Link href="/signup" className="text-white hover:text-slate-200 font-medium">
              Sign Up
            </Link>
          </p>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
              Powered by Next.js 16 & Gemini
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
