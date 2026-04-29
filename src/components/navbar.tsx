"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sparkles, LayoutDashboard, LogOut, User } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 w-full z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 aura-gradient rounded-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">Aura AI</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-white/70 hover:text-white flex items-center gap-1 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <div className="h-4 w-[1px] bg-white/10" />
                <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-white">{session.user?.name}</span>
                    <span className="text-[10px] text-white/50">{session.user?.email}</span>
                  </div>
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-white/50" />
                    </div>
                  )}
                  <button
                    onClick={() => signOut()}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-red-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-white aura-gradient rounded-full hover:opacity-90 transition-opacity"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
