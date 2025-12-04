"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "../../../../lib/supabaseClient";

type ResultRow = {
    id: string;
    name: string;
    score: number;
    created_at: string;
};

export default function ResultsPage() {
    const params = useParams<{ testId: string }>();
    const testId = params?.testId as string;

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [results, setResults] = useState<ResultRow[]>([]);

    // İstatistikler
    const totalPlayers = results.length;
    const bestScore = useMemo(
        () => (results.length ? Math.max(...results.map((r) => r.score)) : null),
        [results]
    );
    const averageScore = useMemo(() => {
        if (!results.length) return null;
        const sum = results.reduce((acc, r) => acc + r.score, 0);
        return sum / results.length;
    }, [results]);

    useEffect(() => {
        const fetchResults = async () => {
            if (!testId) return;

            setLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from("test_results")
                .select("id, name, score, created_at")
                .eq("test_id", testId)
                .order("score", { ascending: false })
                .order("created_at", { ascending: true });

            if (error) {
                console.error("Sonuçlar yüklenirken hata:", error);
                setLoadError("Bu teste ait sonuçlar yüklenirken bir sorun oluştu.");
                setLoading(false);
                return;
            }

            setResults(data ?? []);
            setLoading(false);
        };

        fetchResults();
    }, [testId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 flex items-center justify-center">
                <div className="rounded-2xl border border-rose-100 bg-white/90 px-6 py-4 shadow-sm text-sm text-rose-700">
                    Skor tablosu yükleniyor... 🌸
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 flex items-center justify-center px-4">
                <div className="max-w-md space-y-3 rounded-3xl border border-rose-100 bg-white/90 px-6 py-5 text-center shadow-sm">
                    <p className="text-sm font-semibold text-rose-600">Skorlar yüklenemedi 😕</p>
                    <p className="text-sm text-rose-700">{loadError}</p>
                </div>
            </div>
        );
    }

    const hasResults = results.length > 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 text-rose-950">
            <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
                <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                            Arkadaşlık testi
                        </p>
                        <h1 className="text-2xl font-bold text-rose-900">
                            Bu testin skor tablosu 🌈
                        </h1>
                        <p className="mt-1 text-xs text-rose-600">
                            Arkadaşlarının aldığı puanları burada görebilirsin; her biri küçük bir “seni ne kadar tanıyorum?” cevabı. 💌
                        </p>
                    </div>
                </header>

                {/* İstatistik kartları */}
                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                            Toplam katılımcı 👥
                        </p>
                        <p className="mt-2 text-2xl font-bold text-rose-900">
                            {totalPlayers}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                            En yüksek skor 🏆
                        </p>
                        <p className="mt-2 text-2xl font-bold text-rose-900">
                            {bestScore !== null ? bestScore : "-"}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-rose-100 bg-white/90 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                            Ortalama skor ⭐
                        </p>
                        <p className="mt-2 text-2xl font-bold text-rose-900">
                            {averageScore !== null ? averageScore.toFixed(1) : "-"}
                        </p>
                    </div>
                </section>

                <main className="rounded-3xl border border-rose-100 bg-white/95 p-6 shadow-lg shadow-rose-100/70">
                    {!hasResults ? (
                        <div className="space-y-2 text-center">
                            <p className="text-sm font-semibold text-rose-700">
                                Bu testi henüz kimse çözmemiş 🥲
                            </p>
                            <p className="text-xs text-rose-600">
                                Linki arkadaşlarınla paylaştığında, ilk skorlar burada görünmeye başlayacak.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h2 className="text-base font-bold text-rose-900">
                                    Arkadaşlarının skorları 📊
                                </h2>
                                <p className="text-xs text-rose-600">
                                    En yüksek skor en üstte listelenir.
                                </p>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/60">
                                <ul className="divide-y divide-rose-100">
                                    {results.map((row, index) => {
                                        const rank = index + 1;
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

                                        return (
                                            <li
                                                key={row.id}
                                                className="flex items-center justify-between px-4 py-3 text-sm"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span
                                                        className={`flex h-7 min-w-[2.1rem] items-center justify-center rounded-full text-xs font-bold ${badgeBg}`}
                                                    >
                                                        {rankEmoji || rank}
                                                    </span>
                                                    <div>
                                                        <p className="font-semibold text-rose-900">
                                                            {row.name}
                                                        </p>
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
                                                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-rose-700 border border-rose-100">
                                                    {row.score}
                                                    <span className="opacity-70"> puan</span>
                                                </span>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
