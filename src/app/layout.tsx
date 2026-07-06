import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aurostars — Developer",
  description: "Aurostars 的个人主页",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col mesh-bg overflow-x-hidden">
        <header className="sticky top-0 z-50 glass-strong">
          <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <a className="hero-gradient-text text-lg font-bold tracking-tight" href="/">
              Aurostars
            </a>
            <ul className="flex gap-1">
              <li>
                <a className="rounded-full px-4 py-1.5 text-sm font-medium bg-blue-500/20 text-blue-400" href="/">
                  首页
                </a>
              </li>
              <li>
                <a className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-300" href="#projects">
                  项目
                </a>
              </li>
              <li>
                <a className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-300" href="#timeline">
                  经历
                </a>
              </li>
              <li>
                <a className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all duration-300" href="#contact">
                  联系
                </a>
              </li>
            </ul>
          </nav>
        </header>
        <main className="min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
        <footer className="mt-10 border-t border-white/5">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6 py-10 text-sm text-slate-500 sm:flex-row sm:justify-between">
            <p>&copy; 2026 Aurostars. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="https://github.com/aurostars" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-blue-400">GitHub</a>
              <a href="mailto:3056728260@qq.com" className="transition-colors hover:text-blue-400">邮箱</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
