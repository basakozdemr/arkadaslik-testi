"use client";

import { useMemo, useState } from "react";

const QUESTION_POOL = [
    "En sevdiğim renk nedir?",
    "En sevdiğim yemek nedir?",
    "En sevdiğim mevsim hangisi?",
    "En sevdiğim film türü nedir?",
    "Tatilde en çok nereye gitmek isterim?",
    "En sevdiğim tatlı hangisi?",
    "Boş zamanlarımı nasıl geçirmekten hoşlanırım?",
    "En sevdiğim müzik türü nedir?",
    "Birlikte en çok ne yapmayı isterim?",
];

export default function CreateTestForm() {
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const [skippedIndexes, setSkippedIndexes] = useState<number[]>([]);
    const [customQuestion, setCustomQuestion] = useState<string | null>(null);
    const [showCustomInput, setShowCustomInput] = useState(false);

    const poolWithCustom = useMemo(() => {
        return customQuestion ? [...QUESTION_POOL, customQuestion] : QUESTION_POOL;
    }, [customQuestion]);

    const currentIndex = useMemo(() => {
        const total = poolWithCustom.length;
        const selectedCount = selectedQuestions.length;
        if (selectedCount >= 10) {
            return null;
        }

        const availableIndexes = poolWithCustom
            .map((question, index) => ({ question, index }))
            .filter(({ index }) => !selectedQuestions.includes(poolWithCustom[index]))
            .map(({ index }) => index);

        if (availableIndexes.length === 0) {
            return skippedIndexes.length > 0 ? skippedIndexes[0] : null;
        }

        return availableIndexes[0];
    }, [poolWithCustom, selectedQuestions, skippedIndexes]);

    const handleSelect = (question: string) => {
        if (selectedQuestions.length >= 10) {
            return;
        }

        setSelectedQuestions((prev) => [...prev, question]);
        setSkippedIndexes((prev) => prev.filter((idx) => poolWithCustom[idx] !== question));
    };

    const handleSkip = () => {
        if (currentIndex === null) {
            return;
        }

        setSkippedIndexes((prev) => [...prev.filter((idx) => idx !== currentIndex), currentIndex]);
    };

    const handleCustomQuestion = () => {
        setShowCustomInput(true);
    };

    const handleCustomSubmit = () => {
        if (!customQuestion || !customQuestion.trim()) {
            return;
        }

        setShowCustomInput(false);
    };

    const handleSubmit = () => {
        if (selectedQuestions.length !== 10) {
            alert("Lütfen 10 soru seç.");
            return;
        }

        console.log("Seçilen sorular:", selectedQuestions);
        if (customQuestion) {
            console.log("Kullanıcının yazdığı soru:", customQuestion);
        }
        alert("Test oluşturuldu (backend daha bağlanmadı)");
    };

    const remaining = 10 - selectedQuestions.length;
    const currentQuestion = currentIndex !== null ? poolWithCustom[currentIndex] : "";

    return (
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col items-center justify-center px-4 py-10">
            <div className="w-full rounded-3xl bg-white p-6 shadow-xl">
                <h1 className="text-2xl font-bold text-slate-900">Kendi testini oluştur</h1>
                <p className="mt-2 text-sm text-slate-500">Kalan soru sayısı: {remaining}</p>

                {selectedQuestions.length > 0 && (
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                        <p className="font-semibold">Seçtiğin sorular:</p>
                        <ul className="mt-2 space-y-1 list-disc pl-5">
                            {selectedQuestions.map((question, index) => (
                                <li key={`${question}-${index}`}>{question}</li>
                            ))}
                        </ul>
                    </div>
                )}

                {selectedQuestions.length < 10 && (
                    <div className="mt-6">
                        <h2 className="text-lg font-semibold text-slate-800">Sıradaki soru</h2>
                        <p className="mt-3 rounded-2xl bg-rose-50 p-5 text-slate-900 shadow-inner">{currentQuestion}</p>
                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={() => handleSelect(currentQuestion)}
                                className="flex-1 rounded-2xl bg-rose-500 px-5 py-3 text-white transition hover:bg-rose-400"
                            >
                                Soruyu seç
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="flex-1 rounded-2xl border border-rose-200 px-5 py-3 text-rose-500 transition hover:bg-rose-50"
                            >
                                Soruyu atla
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={handleCustomQuestion}
                            className="mt-4 inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-rose-500 shadow hover:bg-rose-50"
                        >
                            Kendi sorumu yazmak istiyorum
                        </button>

                        {showCustomInput && (
                            <div className="mt-4 space-y-2">
                                <textarea
                                    value={customQuestion ?? ""}
                                    onChange={(event) => setCustomQuestion(event.target.value)}
                                    placeholder="Sorunu buraya yaz"
                                    className="h-28 w-full rounded-2xl border border-rose-200 p-4 text-sm text-slate-900"
                                />
                                <button
                                    type="button"
                                    onClick={handleCustomSubmit}
                                    className="rounded-2xl bg-rose-500 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-400"
                                >
                                    Soruyu ekle
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    className="mt-6 w-full rounded-2xl bg-slate-900 px-5 py-3 text-lg font-semibold text-white transition hover:bg-slate-800"
                >
                    Testi oluştur
                </button>
            </div>
        </div>
    );
}
