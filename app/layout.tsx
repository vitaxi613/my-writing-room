import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Long_Cang,
  Noto_Serif_SC,
  Zhi_Mang_Xing,
} from "next/font/google";
import "./globals.css";
import { SiteHeaderTitle } from "./components/SiteHeaderTitle";
import { WriterRouteGate } from "./components/WriterRouteGate";
import { CloudSyncProvider } from "./components/CloudSyncProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const zhiMangXing = Zhi_Mang_Xing({
  variable: "--font-zhi-mang",
  subsets: ["latin"],
  weight: "400",
});

/** 首页房间标题：更松、更暖的手写感（仅用于少数标题位，非全站） */
const longCang = Long_Cang({
  variable: "--font-hand-room",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "我写字的房间",
  description: "面向长文与完整表达的线上写作空间；也可在共写里看见他人的字。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoSerifSc.variable} ${zhiMangXing.variable} ${longCang.variable} antialiased bg-[var(--background)] text-zinc-950`}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-[var(--paper-line)] bg-[#fffdf7]/90 backdrop-blur-sm dark:bg-zinc-900/80">
            <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 max-w-[55%] items-baseline sm:max-w-[65%]">
                <a
                  href="/"
                  className="block min-w-0 max-w-full truncate transition hover:opacity-90"
                >
                  <SiteHeaderTitle />
                </a>
              </div>
              <nav className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 text-sm text-zinc-600 dark:text-zinc-400">
                <a
                  href="/"
                  className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  首页
                </a>
                <a
                  href="/inspiration"
                  className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  找灵感
                </a>
                <a
                  href="/public"
                  className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  共写空间
                </a>
                <a
                  href="/me"
                  className="transition hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  我的房间
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
              <WriterRouteGate>
                <CloudSyncProvider>{children}</CloudSyncProvider>
              </WriterRouteGate>
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
