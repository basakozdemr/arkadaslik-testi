"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";
import AnswersDetails from "../../../../components/AnswersDetails";

type TestQuestion = {
    id: string;
    text: string;
    answer: string;
};

type TestRow = {
    questions: TestQuestion[];
};

type ResultRow = {
    id: string;
    name: string;
    score: number;
    created_at: string;
    answers: Record<string, string> | null;
};

export default function ResultsPage() {
    const params = useParams<{ testId: string }>();
    const testId = params?.testId as string;
    const [canSeeDetails, setCanSeeDetails] = useState(false);

    useEffect(() => {
        const ok = localStorage.getItem(`solved:${testId}`) === "1";
        setCanSeeDetails(ok);
    }, [testId]);

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [results, setResults] = useState<ResultRow[]>([]);
    const [questions, setQuestions] = useState<TestQuestion[]>([]);

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
        const fetchAll = async () => {
            if (!testId) return;

            setLoading(true);
            setLoadError(null);

            // 1) Sonuçlar (answers ile birlikte)
            const { data: resultsData, error: resultsError } = await supabase
                .from("test_results")
                .select("id, name, score, created_at, answers")
                .eq("test_id", testId)
                .order("score", { ascending: false })
                .order("created_at", { ascending: true });

            if (resultsError) {
                console.error("Sonuçlar yüklenirken hata:", resultsError);
                setLoadError("Bu teste ait sonuçlar yüklenirken bir sorun oluştu.");
                setLoading(false);
                return;
            }

            setResults(
                (resultsData ?? []).map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    score: r.score,
                    created_at: r.created_at,
                    answers: (r.answers || null) as Record<string, string> | null,
                }))
            );

            // 2) Test soruları (doğru cevapları bilmek için)
            const { data: testData, error: testError } = await supabase
                .from("tests")
                .select("questions")
                .eq("id", testId)
                .single<TestRow>();

            if (testError) {
                console.error("Test soruları yüklenirken hata:", testError);
                setQuestions([]);
            } else {
                setQuestions(testData?.questions ?? []);
            }

            setLoading(false);
        };

        fetchAll();
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
                            Arkadaşlarının aldığı puanları burada görebilirsin; her biri küçük bir
                            “seni ne kadar tanıyorum?” cevabı. 💌
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

                            {canSeeDetails ? (
                                <div className="overflow-hidden rounded-2xl border border-rose-100 bg-rose-50/60">
                                    <ul className="divide-y divide-rose-100">
                                        {results.map((row, index) => (
                                            <AnswersDetails
                                                key={row.id}
                                                row={row}
                                                rank={index + 1}
                                                questions={questions}
                                            />
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-rose-100 bg-white/90 p-4 text-sm text-rose-700">
                                    Detayları görmek için testi çözmen gerekiyor 🔒
                                </div>
                            )}

                        </div>
                    )}
                </main>

                {/* Kendi testini oluştur CTA bölümü */}
                <section className="rounded-3xl border border-rose-100 bg-white/90 p-5 shadow-sm flex flex-col items-center text-center gap-3">
                    <h2 className="text-base font-bold text-rose-900">
                        Sıra sende ✨
                    </h2>
                    <p className="text-xs text-rose-600 max-w-sm">
                        Başkasının testine baktın, şimdi istersen sen de kendi arkadaşlık testini hazırlayıp
                        linki arkadaşlarınla paylaşabilirsin.
                    </p>
                    <Link
                        href="https://arkadaslik-testi.flovi.com.tr"
                        className="mt-1 inline-flex items-center justify-center rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                    >
                        Kendi testimi hazırlamak istiyorum 💘
                    </Link>
                </section>
            </div>
        </div>
    );
}
