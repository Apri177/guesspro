"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";

const gameOptions = [
  "리그 오브 레전드",
  "발로란트",
  "오버워치 2",
  "메이플스토리",
  "배틀그라운드",
  "기타",
];

const timerOptions = [
  { label: "없음", value: 0 },
  { label: "30초", value: 30 },
  { label: "20초", value: 20 },
  { label: "10초", value: 10 },
];

type Question = {
  videoUrl: string;
  answerId: number;
  comment: string;
};

export default function QuizCreatePage() {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [title, setTitle] = useState("");
  const [game, setGame] = useState(gameOptions[0]);
  const [description, setDescription] = useState("");
  const [quizMode, setQuizMode] = useState<"objective" | "subjective">(
    "objective",
  );
  const [players, setPlayers] = useState<string[]>([]);
  const [playerInput, setPlayerInput] = useState("");
  const [timer, setTimer] = useState(0);

  // Step 2 state
  const [questions, setQuestions] = useState<Question[]>([
    { videoUrl: "", answerId: 0, comment: "" },
  ]);

  function addPlayer() {
    const name = playerInput.trim();
    if (name && !players.includes(name)) {
      setPlayers([...players, name]);
      setPlayerInput("");
    }
  }

  function removePlayer(idx: number) {
    setPlayers(players.filter((_, i) => i !== idx));
  }

  function updateQuestion(idx: number, field: keyof Question, value: string | number) {
    setQuestions(
      questions.map((q, i) => (i === idx ? { ...q, [field]: value } : q)),
    );
  }

  function addQuestion() {
    setQuestions([...questions, { videoUrl: "", answerId: 0, comment: "" }]);
  }

  function removeQuestion(idx: number) {
    if (questions.length <= 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  }

  const stepLabels = ["기본 정보", "문제 추가", "미리보기"];

  return (
    <div className="min-h-screen bg-[#2f329b] text-white">
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        {/* Step indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm">
            <h1 className="text-lg font-bold">문제 만들기</h1>
            <span className="text-white/60">
              Step {step} / {stepLabels.length}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-center">
                  <div
                    className={`h-1 flex-1 rounded-full transition ${i + 1 <= step ? "bg-fuchsia-500" : "bg-white/15"}`}
                  />
                </div>
                <span
                  className={`text-[11px] ${i + 1 <= step ? "text-white" : "text-white/40"}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Basic info */}
        {step === 1 && (
          <div className="space-y-5 rounded-xl bg-[#3438aa] p-5 shadow-lg">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                퀴즈 제목
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='예: "T1 선수 플레이 맞추기"'
                className="h-11 w-full rounded-lg border border-white/20 bg-white px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                게임 선택
              </label>
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="h-11 w-full rounded-lg border border-white/20 bg-white px-3 text-sm text-slate-900 outline-none focus:border-fuchsia-400"
              >
                {gameOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                기본 출제 형식{" "}
                <span className="font-normal text-white/40">
                  (풀이자가 전환 가능)
                </span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setQuizMode("objective")}
                  className={`flex-1 rounded-lg border p-3 text-left transition ${
                    quizMode === "objective"
                      ? "border-fuchsia-400 bg-fuchsia-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-sm font-semibold">객관식</div>
                  <div className="mt-0.5 text-xs text-white/50">
                    플레이어 후보 중 선택
                  </div>
                </button>
                <button
                  onClick={() => setQuizMode("subjective")}
                  className={`flex-1 rounded-lg border p-3 text-left transition ${
                    quizMode === "subjective"
                      ? "border-fuchsia-400 bg-fuchsia-500/20"
                      : "border-white/20 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="text-sm font-semibold">주관식</div>
                  <div className="mt-0.5 text-xs text-white/50">
                    이름을 직접 입력
                  </div>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                퀴즈 설명{" "}
                <span className="font-normal text-white/40">(선택)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="퀴즈에 대한 간단한 설명을 입력하세요."
                rows={3}
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                플레이어 후보 등록{" "}
                <span className="font-normal text-white/40">
                  (선택지로 사용됩니다)
                </span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addPlayer();
                    }
                  }}
                  placeholder="플레이어 이름"
                  className="h-10 flex-1 rounded-lg border border-white/20 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-fuchsia-400"
                />
                <button
                  type="button"
                  onClick={addPlayer}
                  className="h-10 rounded-lg bg-white/15 px-4 text-sm font-medium transition hover:bg-white/25"
                >
                  추가
                </button>
              </div>
              {players.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {players.map((p, i) => (
                    <span
                      key={p}
                      className="flex items-center gap-1.5 rounded-full bg-white/15 py-1 pl-3 pr-2 text-sm"
                    >
                      {p}
                      <button
                        onClick={() => removePlayer(i)}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-white/50 transition hover:bg-white/20 hover:text-white"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">
                타이머 설정
              </label>
              <div className="flex gap-2">
                {timerOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTimer(opt.value)}
                    className={`rounded-lg border px-4 py-2 text-sm transition ${
                      timer === opt.value
                        ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                        : "border-white/20 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                disabled={!title.trim() || players.length < 2}
                className="rounded-lg bg-fuchsia-500 px-6 py-2.5 text-sm font-semibold transition hover:bg-fuchsia-400 disabled:opacity-40 disabled:hover:bg-fuchsia-500"
              >
                다음: 문제 추가 &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Add questions */}
        {step === 2 && (
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div
                key={qi}
                className="rounded-xl bg-[#3438aa] p-5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">문제 {qi + 1}</h3>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qi)}
                      className="text-xs text-white/40 transition hover:text-red-400"
                    >
                      삭제
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-4">
                  {/* Video upload area */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      영상
                    </label>
                    <div className="rounded-lg border-2 border-dashed border-white/20 p-6 text-center">
                      <svg
                        className="mx-auto h-10 w-10 text-white/30"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <p className="mt-2 text-sm text-white/40">
                        파일을 드래그하거나 클릭하여 업로드
                      </p>
                      <p className="mt-1 text-xs text-white/25">
                        mp4, webm / 최대 100MB
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-white/40">또는</span>
                      <input
                        type="text"
                        value={q.videoUrl}
                        onChange={(e) =>
                          updateQuestion(qi, "videoUrl", e.target.value)
                        }
                        placeholder="YouTube URL 입력"
                        className="h-9 flex-1 rounded-lg border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/30 focus:border-fuchsia-400"
                      />
                    </div>
                  </div>

                  {/* Answer selection */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      정답 선택
                    </label>
                    {players.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {players.map((p, pi) => (
                          <button
                            key={p}
                            onClick={() => updateQuestion(qi, "answerId", pi)}
                            className={`rounded-lg border px-4 py-2 text-sm transition ${
                              q.answerId === pi
                                ? "border-emerald-400 bg-emerald-500/20"
                                : "border-white/20 bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-white/40">
                        Step 1에서 플레이어를 등록해주세요.
                      </p>
                    )}
                  </div>

                  {/* Author comment */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      출제자 코멘트{" "}
                      <span className="font-normal text-white/40">
                        (정답 공개 시 표시)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={q.comment}
                      onChange={(e) =>
                        updateQuestion(qi, "comment", e.target.value)
                      }
                      placeholder='예: "이 캐릭터 운용 스타일 보면 바로 알 수 있죠"'
                      className="h-10 w-full rounded-lg border border-white/20 bg-white/10 px-3 text-sm outline-none placeholder:text-white/30 focus:border-fuchsia-400"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addQuestion}
              className="w-full rounded-xl border-2 border-dashed border-white/20 py-4 text-sm text-white/50 transition hover:border-white/30 hover:text-white/70"
            >
              + 문제 추가
            </button>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm transition hover:bg-white/10"
              >
                &larr; 이전
              </button>
              <button
                onClick={() => setStep(3)}
                className="rounded-lg bg-fuchsia-500 px-6 py-2.5 text-sm font-semibold transition hover:bg-fuchsia-400"
              >
                다음: 미리보기 &rarr;
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-xl bg-[#3438aa] p-5 shadow-lg">
              <h2 className="text-xl font-bold">{title || "제목 없음"}</h2>
              <span className="mt-1 inline-block rounded-md bg-white/10 px-2.5 py-1 text-xs">
                {game}
              </span>
              {description && (
                <p className="mt-3 text-sm text-white/60">{description}</p>
              )}
              <div className="mt-2 text-sm text-white/40">
                {questions.length}문제 ·{" "}
                {quizMode === "objective" ? "객관식" : "주관식"}
                {timer > 0 ? ` · ${timer}초 타이머` : " · 타이머 없음"}
              </div>
            </div>

            {questions.map((q, qi) => (
              <div key={qi} className="rounded-xl bg-[#3438aa] p-5 shadow-lg">
                <h3 className="text-sm font-medium text-white/60">
                  문제 {qi + 1}
                </h3>
                <div className="mt-3 aspect-video w-full rounded-lg bg-black/30">
                  <div className="flex h-full items-center justify-center text-white/20">
                    {q.videoUrl ? (
                      <span className="text-sm">{q.videoUrl}</span>
                    ) : (
                      <span className="text-sm">영상 미등록</span>
                    )}
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-xs text-white/40">선택지:</span>
                  <div className="mt-1.5 flex flex-wrap gap-2">
                    {players.map((p, pi) => (
                      <span
                        key={p}
                        className={`rounded-lg border px-3 py-1.5 text-sm ${
                          q.answerId === pi
                            ? "border-emerald-400 bg-emerald-500/20"
                            : "border-white/20 bg-white/5"
                        }`}
                      >
                        {p}
                        {q.answerId === pi && (
                          <span className="ml-1.5 text-emerald-400">
                            &#10003;
                          </span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                {q.comment && (
                  <p className="mt-2 text-sm text-white/40">
                    코멘트: &ldquo;{q.comment}&rdquo;
                  </p>
                )}
              </div>
            ))}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="rounded-lg border border-white/20 px-5 py-2.5 text-sm transition hover:bg-white/10"
              >
                &larr; 수정하기
              </button>
              <button className="rounded-lg bg-fuchsia-500 px-6 py-2.5 text-sm font-semibold transition hover:bg-fuchsia-400">
                게시하기
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-white/40 hover:text-white/60">
            취소하고 돌아가기
          </Link>
        </div>
      </main>
    </div>
  );
}
