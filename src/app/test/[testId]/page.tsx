"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../../../lib/supabaseClient";

type TestQuestion = {
    id: string;
    text: string;
    options: string[];
    answer: string;
};

type TestRow = {
    questions: TestQuestion[];
    creator_name: string; // 🔴 BURAYA EKLEDİK
};

export default function TestSolvePage() {
    const params = useParams<{ testId: string }>();
    const testId = params?.testId as string;

    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<TestQuestion[] | null>(null);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [score, setScore] = useState<number | null>(null);
    const [isRevealing, setIsRevealing] = useState(false);

    const [playerName, setPlayerName] = useState("");
    const [hasStarted, setHasStarted] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savingResult, setSavingResult] = useState(false);
    const [resultSaved, setResultSaved] = useState(false);

    // 🔴 TESTİ OLUŞTURANIN ADI İÇİN STATE
    const [creatorName, setCreatorName] = useState<string>("");

    const totalQuestions = questions?.length ?? 0;

    const currentQuestion = useMemo(
        () => (questions && questions.length > 0 ? questions[currentIndex] : null),
        [questions, currentIndex]
    );

    // Testi Supabase'ten çek
    useEffect(() => {
        const fetchTest = async () => {
            if (!testId) return;
            setLoading(true);
            setLoadError(null);

            const { data, error } = await supabase
                .from("tests")
                .select("questions, creator_name") // 🔴 BURADA ARTIK CREATOR_NAME DE ÇEKİLİYOR
                .eq("id", testId)
                .single<TestRow>();

            if (error) {
                console.error("Test yüklenirken hata:", error);
                setLoadError("Bu linke ait bir test bulunamadı ya da test kaldırılmış olabilir.");
                setLoading(false);
                return;
            }

            if (!data || !data.questions || data.questions.length === 0) {
                setLoadError("Bu test için soru bulunamadı.");
                setLoading(false);
                return;
            }

            setQuestions(data.questions);
            setCreatorName(data.creator_name || ""); // 🔴 TESTİ OLUŞTURANIN ADINI STATE'E ATTIK
            setCurrentIndex(0);
            setAnswers({});
            setScore(null);
            setIsRevealing(false);
            setResultSaved(false);
            setSavingResult(false);
            setSaveError(null);
            setLoading(false);
        };

        fetchTest();
    }, [testId]);

    const handleStart = () => {
        if (!playerName.trim()) return;
        setHasStarted(true);
    };

    const handleAnswer = (option: string) => {
        if (!questions || !currentQuestion || score !== null || isRevealing) return;

        const newAnswers = {
            ...answers,
            [currentQuestion.id]: option,
        };
        setAnswers(newAnswers);
        setIsRevealing(true);

        const isLast = currentIndex === questions.length - 1;

        if (!isLast) {
            setTimeout(() => {
                setCurrentIndex((prev) => prev + 1);
                setIsRevealing(false);
            }, 900);
        } else {
            setTimeout(() => {
                const totalScore = questions.reduce((sum, q) => {
                    const userAnswer = newAnswers[q.id];
                    return sum + (userAnswer === q.answer ? 1 : 0);
                }, 0);
                setScore(totalScore);
                setIsRevealing(false);
            }, 900);
        }
    };

    // Skoru Supabase test_results tablosuna kaydet
    useEffect(() => {
        const saveResult = async () => {
            if (score === null || !testId || !playerName.trim() || resultSaved || savingResult)
                return;

            setSavingResult(true);
            setSaveError(null);

            const { error } = await supabase.from("test_results").insert({
                test_id: testId,
                name: playerName.trim(),
                score: score,
            });

            if (error) {
                console.error("Sonuç kaydedilirken hata:", error);
                setSaveError("Skor kaydedilirken bir sorun oluştu.");
                setSavingResult(false);
                return;
            }

            setResultSaved(true);
            setSavingResult(false);
        };

        saveResult();
    }, [score, testId, playerName, resultSaved, savingResult]);

    const handleRestart = () => {
        setCurrentIndex(0);
        setAnswers({});
        setScore(null);
        setIsRevealing(false);
        setResultSaved(false);
        setSavingResult(false);
        setSaveError(null);
        setHasStarted(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 flex items-center justify-center">
                <div className="rounded-2xl border border-rose-100 bg-white/90 px-6 py-4 shadow-sm text-sm text-rose-700">
                    Test yükleniyor... 🌸
                </div>
            </div>
        );
    }

    if (loadError || !questions) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 flex items-center justify-center px-4">
                <div className="max-w-md space-y-3 rounded-3xl border border-rose-100 bg-white/90 px-6 py-5 text-center shadow-sm">
                    <p className="text-sm font-semibold text-rose-600">Test bulunamadı 😕</p>
                    <p className="text-sm text-rose-700">
                        {loadError ??
                            "Bu test artık geçerli olmayabilir veya linkte küçük bir hata olabilir."}
                    </p>
                </div>
            </div>
        );
    }

    const isFinished = score !== null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50 text-rose-950">
            <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-10">
                <header className="flex items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                            Arkadaşlık testi
                        </p>
                        <h1 className="text-2xl font-bold text-rose-900">
                            Arkadaşının testini çöz 💫
                        </h1>
                        <p className="mt-1 text-xs text-rose-600">
                            Soruları cevapla, onu ne kadar iyi tanıdığını puanın göstersin. ⭐
                        </p>
                    </div>
                    <div className="hidden sm:flex items-center rounded-full bg-white px-4 py-2 text-[11px] font-semibold text-rose-700 border border-rose-100 shadow-sm">
                        Bol şans 🍀
                    </div>
                </header>

                {!hasStarted && !isFinished && (
                    <main className="space-y-4 rounded-3xl border border-rose-100 bg-white/95 p-6 shadow-lg shadow-rose-100/70">
                        <p className="text-sm font-semibold text-rose-700">
                            Başlamadan önce adını yazman yeterli 🌷
                        </p>
                        <input
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            placeholder="İstersen takma ad da yazabilirsin..."
                            className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                        />
                        <button
                            type="button"
                            onClick={handleStart}
                            disabled={!playerName.trim()}
                            className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <span>Teste başla</span>
                            <span>🚀</span>
                        </button>
                    </main>
                )}

                {hasStarted && !isFinished && currentQuestion && (
                    <main className="space-y-5 rounded-3xl border border-rose-100 bg-white/95 p-6 shadow-lg shadow-rose-100/70">
                        <div className="flex items-center justify-between gap-3">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-rose-500">
                                    Soru {currentIndex + 1} / {totalQuestions}
                                </p>
                                <h2 className="text-lg font-semibold text-rose-900">
                                    {/* 🔴 BURADA ARTIK TESTİ OLUŞTURANIN ADI DA VAR */}
                                    {creatorName
                                        ? `${creatorName} ${currentQuestion.text}`
                                        : currentQuestion.text}
                                </h2>
                            </div>
                            <div className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600 border border-rose-100">
                                Tek cevap hakkı 🔒
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                            {currentQuestion.options.map((option, index) => {
                                const userAnswer = answers[currentQuestion.id];
                                const isAnswered = userAnswer !== undefined;

                                const isCorrect = option === currentQuestion.answer;
                                const isSelected = option === userAnswer;

                                let bg = "bg-white";
                                let border = "border-rose-200";
                                let text = "text-rose-900";

                                if (isAnswered) {
                                    if (isSelected && isCorrect) {
                                        bg = "bg-green-100";
                                        border = "border-green-400";
                                        text = "text-green-900 font-bold";
                                    } else if (isSelected && !isCorrect) {
                                        bg = "bg-red-100";
                                        border = "border-red-400";
                                        text = "text-red-900 font-bold";
                                    } else if (isCorrect) {
                                        bg = "bg-green-50";
                                        border = "border-green-300";
                                        text = "text-green-900";
                                    } else {
                                        bg = "bg-white/80";
                                        border = "border-rose-100";
                                        text = "text-rose-400";
                                    }
                                }

                                return (
                                    <button
                                        key={`${option}-${index}`}
                                        type="button"
                                        onClick={() => handleAnswer(option)}
                                        disabled={isAnswered || isRevealing}
                                        className={`rounded-xl border ${border} ${bg} px-4 py-3 text-left text-sm font-light ${text} transition 
                      hover:-translate-y-[1px] hover:shadow disabled:cursor-not-allowed`}
                                    >
                                        {option}
                                    </button>
                                );
                            })}
                        </div>
                    </main>
                )}

                {isFinished && (
                    <main className="space-y-5 rounded-3xl border border-rose-100 bg-white/95 p-6 shadow-lg shadow-rose-100/70">
                        <p className="text-sm font-semibold text-rose-600">Test tamamlandı 🎉</p>
                        <p className="text-2xl font-bold text-rose-900">
                            {playerName.trim() || "İsimsiz"} için skor: {score} / {totalQuestions} ⭐
                        </p>
                        <p className="text-xs text-rose-600">
                            Arkadaşının nasıl bir test hazırladığını görmek için sonuçlar kısmına da bakabilirsin. 💖
                        </p>

                        {savingResult && (
                            <p className="text-xs text-rose-600">Skorun kaydediliyor...</p>
                        )}
                        {resultSaved && !savingResult && !saveError && (
                            <p className="text-xs text-green-700">
                                Skorun bu testin sonuç listesine eklendi. 🎀
                            </p>
                        )}
                        {saveError && (
                            <p className="text-xs text-red-600">
                                {saveError} Yine de istersen testi tekrar çözebilirsin.
                            </p>
                        )}

                        <div className="flex flex-wrap gap-3 mt-2">
                            <button
                                type="button"
                                onClick={handleRestart}
                                className="inline-flex items-center justify-center gap-1 rounded-full bg-rose-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                            >
                                <span>Testi yeniden çöz</span>
                                <span>🔁</span>
                            </button>

                            <Link
                                href={`/results/${testId}`}
                                className="inline-flex items-center justify-center gap-1 rounded-full border border-rose-300 bg-white px-5 py-2 text-sm font-semibold text-rose-700 shadow-sm transition hover:border-rose-400 hover:text-rose-800"
                            >
                                <span>Skor tablosunu gör</span>
                                <span>📊</span>
                            </Link>
                        </div>
                    </main>
                )}
            </div>
        </div>
    );
}
