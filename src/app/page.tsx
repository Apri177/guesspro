"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

type Quiz = {
  id: number;
  title: string;
  game: string;
  accent: string;
  duration: string;
  author: string;
  accuracy: number;
  plays: string;
  hot?: boolean;
};

const games = [
  "전체",
  "리그 오브 레전드",
  "발로란트",
  "오버워치 2",
  "메이플스토리",
  "기타",
];

const quizzes: Quiz[] = [
  {
    id: 1,
    title: "T1 선수 솔랭 맞추기",
    game: "리그 오브 레전드",
    accent: "from-indigo-500 to-purple-700",
    duration: "0:42",
    author: "GuessMaster",
    accuracy: 32,
    plays: "2.1만",
    hot: true,
  },
  {
    id: 2,
    title: "프로 발로란트 에이스 장면",
    game: "발로란트",
    accent: "from-red-500 to-rose-700",
    duration: "1:15",
    author: "ValFan",
    accuracy: 18,
    plays: "1.3만",
    hot: true,
  },
  {
    id: 3,
    title: "누구의 정글링일까?",
    game: "리그 오브 레전드",
    accent: "from-emerald-500 to-teal-700",
    duration: "0:55",
    author: "JungleDiff",
    accuracy: 45,
    plays: "9,420",
    hot: true,
  },
  {
    id: 4,
    title: "오버워치 프로 위도우 에임",
    game: "오버워치 2",
    accent: "from-orange-400 to-red-600",
    duration: "0:38",
    author: "OWClips",
    accuracy: 28,
    plays: "8,010",
    hot: true,
  },
  {
    id: 5,
    title: "메이플 보스전 누구 캐릭?",
    game: "메이플스토리",
    accent: "from-amber-400 to-orange-600",
    duration: "1:02",
    author: "MapleKing",
    accuracy: 51,
    plays: "5,230",
  },
  {
    id: 6,
    title: "발로란트 원탭 장인은 누구",
    game: "발로란트",
    accent: "from-pink-500 to-fuchsia-700",
    duration: "0:30",
    author: "HeadshotKR",
    accuracy: 22,
    plays: "1.7만",
  },
  {
    id: 7,
    title: "스트리머 솔랭 맞추기 시즌2",
    game: "리그 오브 레전드",
    accent: "from-cyan-500 to-blue-700",
    duration: "0:48",
    author: "StreamSnipe",
    accuracy: 38,
    plays: "7,125",
  },
  {
    id: 8,
    title: "프로선수 연습실 에임 맞추기",
    game: "오버워치 2",
    accent: "from-violet-500 to-indigo-700",
    duration: "0:40",
    author: "AimLab",
    accuracy: 15,
    plays: "4,800",
  },
];

export default function Home() {
  const [selectedGame, setSelectedGame] = useState("전체");
  const [sortBy, setSortBy] = useState<"latest" | "popular">("latest");
  const [search, setSearch] = useState("");

  const hotQuizzes = quizzes.filter((q) => q.hot);

  const filteredQuizzes = useMemo(() => {
    let result = quizzes;
    if (selectedGame !== "전체") {
      result = result.filter((q) => q.game === selectedGame);
    }
    if (search.trim()) {
      const term = search.trim().toLowerCase();
      result = result.filter(
        (q) =>
          q.title.toLowerCase().includes(term) ||
          q.game.toLowerCase().includes(term),
      );
    }
    if (sortBy === "popular") {
      result = [...result].sort((a, b) => a.accuracy - b.accuracy);
    }
    return result;
  }, [selectedGame, sortBy, search]);

  return (
    <div className="min-h-screen bg-[#2f329b] text-white">
      <Header />

      <main className="mx-auto flex w-full max-w-6xl flex-col px-4 py-6">
        {/* Notice */}
        <div className="rounded-lg bg-[#24277a] px-4 py-2.5 text-sm text-white/70">
          <span className="mr-2 rounded bg-fuchsia-500/20 px-1.5 py-0.5 text-xs font-medium text-fuchsia-300">
            공지
          </span>
          게임 플레이를 보고 누가 했는지 맞춰보세요!
        </div>

        {/* Hot section */}
        <section className="mt-6">
          <h2 className="text-base font-bold">인기 문제</h2>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {hotQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        </section>

        {/* Search + Filter */}
        <section className="mt-8 rounded-xl bg-[#3438aa] p-4 shadow-lg shadow-black/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="문제 또는 게임을 검색하세요"
              className="h-11 w-full rounded-lg border border-white/20 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
            />
            <button className="h-11 shrink-0 rounded-lg bg-fuchsia-500 px-5 text-sm font-semibold transition hover:bg-fuchsia-400">
              검색
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {games.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGame(g)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  selectedGame === g
                    ? "border-white bg-white text-[#2f329b] font-semibold"
                    : "border-white/20 bg-white/10 hover:bg-white/20"
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </section>

        {/* All quizzes */}
        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold">최신 문제</h2>
            <div className="flex gap-1 rounded-lg bg-white/10 p-0.5">
              <button
                onClick={() => setSortBy("latest")}
                className={`rounded-md px-3 py-1 text-xs transition ${
                  sortBy === "latest"
                    ? "bg-white text-[#2f329b] font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                최신
              </button>
              <button
                onClick={() => setSortBy("popular")}
                className={`rounded-md px-3 py-1 text-xs transition ${
                  sortBy === "popular"
                    ? "bg-white text-[#2f329b] font-semibold"
                    : "text-white/60 hover:text-white"
                }`}
              >
                인기
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filteredQuizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>

          {filteredQuizzes.length === 0 && (
            <div className="mt-8 text-center text-white/40">
              <p>검색 결과가 없습니다.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function QuizCard({ quiz }: { quiz: Quiz }) {
  return (
    <Link
      href={`/quiz/${quiz.id}`}
      className="group overflow-hidden rounded-xl bg-white text-left text-slate-900 shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div
        className={`relative aspect-video w-full bg-gradient-to-br ${quiz.accent}`}
      >
        {/* Play icon overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50">
            <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
        {/* Duration badge */}
        <span className="absolute bottom-1.5 right-1.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {quiz.duration}
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="line-clamp-1 text-sm font-semibold">{quiz.title}</h3>
        <div className="mt-1 flex items-center gap-1.5">
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
            {quiz.game}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>{quiz.author}</span>
          <div className="flex items-center gap-2">
            <span
              className={
                quiz.accuracy < 25 ? "font-medium text-red-500" : ""
              }
            >
              정답률 {quiz.accuracy}%
            </span>
            <span>{quiz.plays}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
