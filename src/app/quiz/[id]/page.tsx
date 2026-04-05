"use client";

import { use, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

type Choice = {
  id: number;
  name: string;
  votes: number;
};

const mockQuiz = {
  id: 1,
  title: "T1 선수 솔랭 맞추기",
  game: "리그 오브 레전드",
  defaultMode: "objective" as "objective" | "subjective",
  totalQuestions: 3,
  questions: [
    {
      id: 1,
      videoUrl: "",
      choices: [
        { id: 1, name: "페이커", votes: 620 },
        { id: 2, name: "데프트", votes: 220 },
        { id: 3, name: "쵸비", votes: 100 },
        { id: 4, name: "제우스", votes: 60 },
      ],
      answerId: 1,
      authorComment: "마우스 컨트롤 보면 바로 알 수 있죠 ㅋㅋ",
    },
    {
      id: 2,
      videoUrl: "",
      choices: [
        { id: 1, name: "페이커", votes: 180 },
        { id: 2, name: "구마유시", votes: 450 },
        { id: 3, name: "오너", votes: 200 },
        { id: 4, name: "케리아", votes: 170 },
      ],
      answerId: 2,
      authorComment: "칼리스타 장인이죠~",
    },
    {
      id: 3,
      videoUrl: "",
      choices: [
        { id: 1, name: "제우스", votes: 310 },
        { id: 2, name: "킹겐", votes: 280 },
        { id: 3, name: "도란", votes: 150 },
        { id: 4, name: "칸나", votes: 260 },
      ],
      answerId: 1,
      authorComment: "이런 공격적인 탑은 제우스밖에 없습니다",
    },
  ],
};

export default function QuizPlayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [mode, setMode] = useState<"objective" | "subjective">(
    mockQuiz.defaultMode,
  );
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [phase, setPhase] = useState<"playing" | "answered">("playing");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = mockQuiz.questions[currentQ];
  const totalVotes = question.choices.reduce((s, c) => s + c.votes, 0);
  const correctChoice = question.choices.find(
    (c) => c.id === question.answerId,
  )!;
  const isCorrect =
    mode === "objective"
      ? selected === question.answerId
      : textAnswer.trim().toLowerCase() === correctChoice.name.toLowerCase();

  function handleSelect(choiceId: number) {
    if (phase !== "playing") return;
    setSelected(choiceId);
    setPhase("answered");
    if (choiceId === question.answerId) {
      setScore((s) => s + 1);
    }
  }

  function handleSubjectiveSubmit() {
    if (phase !== "playing" || !textAnswer.trim()) return;
    setPhase("answered");
    if (
      textAnswer.trim().toLowerCase() === correctChoice.name.toLowerCase()
    ) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (currentQ + 1 >= mockQuiz.questions.length) {
      setFinished(true);
      return;
    }
    setCurrentQ((q) => q + 1);
    setSelected(null);
    setTextAnswer("");
    setPhase("playing");
  }

  function handleModeSwitch(newMode: "objective" | "subjective") {
    if (phase === "answered") return;
    setMode(newMode);
    setSelected(null);
    setTextAnswer("");
  }

  if (finished) {
    return (
      <div className="min-h-screen bg-[#2f329b] text-white">
        <Header />
        <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-16">
          <div className="w-full rounded-2xl bg-[#3438aa] p-8 text-center shadow-lg">
            <div className="text-5xl font-bold">
              {score} / {mockQuiz.questions.length}
            </div>
            <p className="mt-3 text-white/60">
              {score === mockQuiz.questions.length
                ? "완벽합니다!"
                : score >= mockQuiz.questions.length / 2
                  ? "잘 하셨어요!"
                  : "다음엔 더 잘할 수 있어요!"}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/"
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm transition hover:bg-white/10"
              >
                목록으로
              </Link>
              <button
                onClick={() => {
                  setCurrentQ(0);
                  setSelected(null);
                  setTextAnswer("");
                  setPhase("playing");
                  setScore(0);
                  setFinished(false);
                }}
                className="rounded-lg bg-fuchsia-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-fuchsia-400"
              >
                다시 풀기
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2f329b] text-white">
      <Header />
      <main className="mx-auto flex w-full max-w-3xl flex-col px-4 py-6">
        {/* Progress */}
        <div className="flex items-center justify-between text-sm">
          <Link
            href="/"
            className="text-white/60 transition hover:text-white"
          >
            &larr; 목록으로
          </Link>
          <span className="text-white/60">
            문제 {currentQ + 1} / {mockQuiz.totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-fuchsia-500 transition-all duration-300"
            style={{
              width: `${((currentQ + (phase === "answered" ? 1 : 0)) / mockQuiz.totalQuestions) * 100}%`,
            }}
          />
        </div>

        {/* Video area */}
        <div className="mt-5 aspect-video w-full overflow-hidden rounded-xl bg-black/40">
          <div className="flex h-full items-center justify-center text-white/30">
            <div className="text-center">
              <svg
                className="mx-auto h-16 w-16"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25z"
                />
              </svg>
              <p className="mt-2 text-sm">영상 플레이어</p>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="mt-5">
          <span className="inline-block rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium">
            {mockQuiz.game}
          </span>
          <h2 className="mt-2 text-lg font-bold">
            이 플레이어는 누구일까요?
          </h2>
        </div>

        {/* Mode toggle */}
        <div className="mt-4 flex items-center gap-3">
          <div className="flex gap-1 rounded-lg bg-white/10 p-0.5">
            <button
              onClick={() => handleModeSwitch("objective")}
              className={`rounded-md px-3 py-1.5 text-xs transition ${
                mode === "objective"
                  ? "bg-white font-semibold text-[#2f329b]"
                  : "text-white/60 hover:text-white"
              } ${phase === "answered" ? "pointer-events-none" : ""}`}
            >
              객관식
            </button>
            <button
              onClick={() => handleModeSwitch("subjective")}
              className={`rounded-md px-3 py-1.5 text-xs transition ${
                mode === "subjective"
                  ? "bg-white font-semibold text-[#2f329b]"
                  : "text-white/60 hover:text-white"
              } ${phase === "answered" ? "pointer-events-none" : ""}`}
            >
              주관식
            </button>
          </div>
          {mode === "subjective" && phase === "playing" && (
            <span className="text-xs text-white/40">
              정답을 직접 입력하세요
            </span>
          )}
        </div>

        {/* Answer area */}
        {mode === "objective" ? (
          /* Objective: choice buttons */
          <div className="mt-4 grid grid-cols-2 gap-3">
            {question.choices.map((choice) => {
              const isAnswer = choice.id === question.answerId;
              const isSelected = choice.id === selected;
              const pct =
                totalVotes > 0
                  ? Math.round((choice.votes / totalVotes) * 100)
                  : 0;

              let style =
                "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30";
              if (phase === "answered") {
                if (isAnswer) {
                  style = "border-emerald-400 bg-emerald-500/20";
                } else if (isSelected && !isAnswer) {
                  style = "border-red-400 bg-red-500/20";
                } else {
                  style = "border-white/10 bg-white/5 opacity-60";
                }
              }

              return (
                <button
                  key={choice.id}
                  onClick={() => handleSelect(choice.id)}
                  disabled={phase === "answered"}
                  className={`relative overflow-hidden rounded-xl border-2 p-4 text-left transition ${style}`}
                >
                  {phase === "answered" && (
                    <div
                      className={`absolute inset-y-0 left-0 transition-all duration-500 ${isAnswer ? "bg-emerald-500/10" : "bg-white/5"}`}
                      style={{ width: `${pct}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <span className="font-semibold">{choice.name}</span>
                    {phase === "answered" && (
                      <span className="text-sm text-white/60">{pct}%</span>
                    )}
                  </div>
                  {phase === "answered" && isAnswer && (
                    <span className="relative mt-1 block text-xs text-emerald-400">
                      정답
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          /* Subjective: text input */
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSubjectiveSubmit();
                  }
                }}
                disabled={phase === "answered"}
                placeholder="플레이어 이름을 입력하세요"
                className="h-12 flex-1 rounded-xl border-2 border-white/20 bg-white/5 px-4 text-base font-medium outline-none placeholder:text-white/30 focus:border-fuchsia-400 disabled:opacity-60"
              />
              <button
                onClick={handleSubjectiveSubmit}
                disabled={phase === "answered" || !textAnswer.trim()}
                className="h-12 rounded-xl bg-fuchsia-500 px-6 text-sm font-semibold transition hover:bg-fuchsia-400 disabled:opacity-40 disabled:hover:bg-fuchsia-500"
              >
                제출
              </button>
            </div>

            {/* Show answer after submission */}
            {phase === "answered" && (
              <div className="mt-3 rounded-xl border-2 border-white/10 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/50">내 답:</span>
                  <span
                    className={`font-semibold ${isCorrect ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {textAnswer}
                  </span>
                </div>
                {!isCorrect && (
                  <div className="mt-2 flex items-center gap-3">
                    <span className="text-sm text-white/50">정답:</span>
                    <span className="font-semibold text-emerald-400">
                      {correctChoice.name}
                    </span>
                  </div>
                )}

                {/* Vote distribution */}
                <div className="mt-4 space-y-2">
                  <span className="text-xs text-white/40">
                    객관식 응답 분포
                  </span>
                  {question.choices.map((choice) => {
                    const isAns = choice.id === question.answerId;
                    const pct =
                      totalVotes > 0
                        ? Math.round((choice.votes / totalVotes) * 100)
                        : 0;
                    return (
                      <div key={choice.id} className="flex items-center gap-3">
                        <span
                          className={`w-16 text-right text-sm ${isAns ? "font-semibold text-emerald-400" : "text-white/60"}`}
                        >
                          {choice.name}
                        </span>
                        <div className="flex-1">
                          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${isAns ? "bg-emerald-500" : "bg-white/20"}`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-xs text-white/40">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Result panel */}
        {phase === "answered" && (
          <div className="mt-5 rounded-xl bg-[#3438aa] p-4">
            <div className="flex items-center gap-2">
              {isCorrect ? (
                <span className="text-lg text-emerald-400">
                  &#10003; 정답!
                </span>
              ) : (
                <span className="text-lg text-red-400">&#10007; 오답!</span>
              )}
            </div>
            {question.authorComment && (
              <p className="mt-2 text-sm text-white/60">
                출제자: &ldquo;{question.authorComment}&rdquo;
              </p>
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={handleNext}
                className="rounded-lg bg-fuchsia-500 px-5 py-2.5 text-sm font-semibold transition hover:bg-fuchsia-400"
              >
                {currentQ + 1 >= mockQuiz.questions.length
                  ? "결과 보기"
                  : "다음 문제 →"}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
