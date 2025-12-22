"use client";

import { useState } from "react";

type TestQuestion = {
    id: string;
    text: string;
    answer: string;
};

type ResultRow = {
    id: string;
    name: string;
    score: number;
    created_at: string;
    answers: Record<string, string> | null; // ✅ nullable
};

type Props = {
    row: ResultRow;
    rank: number;
    questions: TestQuestion[];
};

export default function AnswersDetails({ row, rank, questions }: Props) {
    const [open, setOpen] = useState(false);

    const isFirst = rank === 1;
    const isSecond = rank === 2;
    const isThird = rank === 3;

    let badgeBg = "bg-rose-100 text-rose-700";
    let rankEmoji = "";

    if (isFirst) {
        badgeBg = "bg-yellow-200 text-yellow-900";
        rankEmoji = "🥇";
    } else if (isSecond) {
        badgeBg = "bg-slate-200 text-slate-800";
        rankEmoji = "🥈";
    } else if (isThird) {
        badgeBg = "bg-amber-200 text-amber-900";
        rankEmoji = "🥉";
    }

    // ✅ null gelebilir -> güvenli hale getir
    const playerAnswers: Record<string, string> = row.answers ?? {};

    const correctCount = questions.reduce((acc, q) => {
        return acc + (playerAnswers[q.id] === q.answer ? 1 : 0);
    }, 0);

    return (
        <li className="px-4 py-3 text-sm">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <span
                        className={`flex h-7 min-w-[2.1rem] items-center justify-center rounded-full text-xs font-bold ${badgeBg}`}
                    >
                        {rankEmoji || rank}
                    </span>

                    <div>
                        <p className="font-semibold text-rose-900">{row.name || "İsimsiz"}</p>
                        <p className="text-[11px] text-rose-500">
                            {new Date(row.created_at).toLocaleString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-100">
                        {row.score}
                        <span className="opacity-70"> puan</span>
                    </span>

                    <button
                        type="button"
                        onClick={() => setOpen((prev) => !prev)}
                        className="rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-[11px] font-semibold text-rose-700 hover:border-rose-300 hover:bg-white transition"
                    >
                        {open ? "Detayı gizle" : "Detay"}
                    </button>
                </div>
            </div>

            {open && (
                <div className="mt-3 rounded-2xl border border-rose-100 bg-white/90 px-3 py-3">
                    <p className="mb-3 text-[11px] text-rose-600">
                        Toplam {questions.length} sorudan{" "}
                        <span className="font-semibold text-emerald-700">{correctCount} doğru</span>{" "}
                        cevap vermiş.
                    </p>

                    {/* ✅ MOBİL (scroll yok) */}
                    <div className="sm:hidden space-y-2">
                        {questions.map((q, index) => {
                            const given = playerAnswers[q.id];
                            const isCorrect = given === q.answer;

                            const border = isCorrect ? "border-emerald-200" : "border-rose-300";
                            const left = isCorrect
                                ? "border-l-4 border-l-emerald-400"
                                : "border-l-4 border-l-rose-500";

                            const givenColor = isCorrect ? "text-emerald-700" : "text-rose-700";

                            return (
                                <div
                                    key={q.id}
                                    className={`rounded-xl border ${border} bg-white ${left} px-3 py-2`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="text-[12px] font-semibold text-rose-900">
                                            {index + 1}. {q.text}
                                        </p>
                                        <span
                                            className={
                                                "shrink-0 inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold border " +
                                                (isCorrect
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                    : "bg-rose-50 text-rose-700 border-rose-200")
                                            }
                                        >
                                            {isCorrect ? "✅" : "❌"}
                                        </span>
                                    </div>

                                    <div className="mt-2 grid grid-cols-2 gap-2 text-[11px]">
                                        <div className="rounded-lg bg-rose-50/40 px-2 py-1">
                                            <p className="text-rose-500 font-semibold">Doğru</p>
                                            <p className="text-emerald-800 font-normal">{q.answer}</p>
                                        </div>

                                        <div className="rounded-lg bg-rose-50/40 px-2 py-1">
                                            <p className="text-rose-500 font-semibold">Verdiği Cevap</p>
                                            <p className={`${givenColor} font-normal`}>{given}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* ✅ DESKTOP/TABLET TABLO */}
                    <div className="hidden sm:block">
                        <table className="min-w-full border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-rose-100">
                                    <th className="px-2 py-2 text-left font-semibold text-rose-500">#</th>
                                    <th className="px-2 py-2 text-left font-semibold text-rose-500">Soru</th>
                                    <th className="px-2 py-2 text-left font-semibold text-rose-500">Doğru</th>
                                    <th className="px-2 py-2 text-left font-semibold text-rose-500">Verdiği Cevap</th>
                                    <th className="px-2 py-2 text-left font-semibold text-rose-500">Durum</th>
                                </tr>
                            </thead>

                            <tbody>
                                {questions.map((q, index) => {
                                    const given = playerAnswers[q.id];
                                    const isCorrect = given === q.answer;

                                    const rowBorder = isCorrect ? "border-emerald-200" : "border-rose-300";
                                    const leftBar = isCorrect
                                        ? "border-l-4 border-l-emerald-400"
                                        : "border-l-4 border-l-rose-500";

                                    const givenColor = isCorrect ? "text-emerald-700" : "text-rose-700";
                                    const tdBase = `px-2 py-2 align-top bg-white border-y ${rowBorder}`;

                                    return (
                                        <tr key={q.id} className="border-b border-rose-100 last:border-0">
                                            <td className={`${tdBase} ${leftBar} rounded-l-xl`}>
                                                <span className="text-rose-400">{index + 1}</span>
                                            </td>

                                            <td className={`${tdBase} text-rose-900`}>{q.text}</td>

                                            <td className={`${tdBase} text-emerald-800 font-normal`}>{q.answer}</td>

                                            <td className={`${tdBase} ${givenColor} font-normal`}>{given}</td>

                                            <td className={`${tdBase} rounded-r-xl`}>
                                                <span
                                                    className={
                                                        "inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold border " +
                                                        (isCorrect
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                                            : "bg-rose-50 text-rose-700 border-rose-200")
                                                    }
                                                >
                                                    {isCorrect ? "✅ Doğru" : "❌ Yanlış"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </li>
    );
}
