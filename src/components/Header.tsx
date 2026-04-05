"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="border-b border-white/15 bg-[#1e205f]">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          GuessPro
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/quiz/create"
            className="rounded-lg bg-fuchsia-500 px-3.5 py-1.5 text-xs font-semibold transition hover:bg-fuchsia-400"
          >
            + 문제 만들기
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-white px-3.5 py-1.5 text-xs font-semibold text-[#1e205f] transition hover:bg-white/90"
          >
            로그인
          </Link>
        </div>
      </div>
    </header>
  );
}
