import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aura AI | Personalized Learning Pathways",
  description: "Illuminate your learning journey with AI-driven personalized pathways.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-[#020617] text-slate-50 min-h-screen`}>
        <Providers>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
          <footer className="border-t border-white/5 py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 text-center">
              <p className="text-sm text-slate-500">
                Built with ❤️ for House of Edtech
              </p>
              <div className="mt-4 flex flex-col gap-2 text-xs text-slate-600">
                <p>Developer: [Raj Srivastava]</p>
                <div className="flex justify-center gap-4">
                  <a href="https://github.com/Imraj2002" className="hover:text-slate-400 transition-colors">GitHub Profile</a>
                  <a href="https://www.linkedin.com/in/raj-srivastava-660b45228/" className="hover:text-slate-400 transition-colors">LinkedIn Profile</a>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
