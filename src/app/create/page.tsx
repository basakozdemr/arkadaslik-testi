"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";
import { addStoredTest } from "../../../lib/friendTestStorage";

type Question = {
    id: string;
    text: string;
    options: string[];
    answer?: string;
};

type SelectedQuestion = {
    questionId: string;
    text: string;
    answer: string;
};

const MAX_SELECTION = 10;
const MIN_CUSTOM_OPTIONS = 2;

const questionPool: Question[] = [
    {
        id: "q1",
        text: "en sık hangisini yapar?",
        options: ["Evde kalır", "Dışarı çıkar", "Aileyle vakit geçirir"],
    },
    {
        id: "q2",
        text: "bir kafede genellikle ne sipariş eder?",
        options: ["Kahve", "Çay", "Soğuk içecek", "Tatlı"],
    },
    {
        id: "q3",
        text: "stresliyken en çok ne yapmayı tercih eder?",
        options: [
            "Yürüyüşe çıkar",
            "Müzik dinler",
            "Dizi/film izler",
            "Uyur",
            "Arkadaşlarıyla konuşur",
        ],
    },
    {
        id: "q4",
        text: "mesajlaşırken hangi tarzı daha çok kullanır?",
        options: [
            "Emoji dolu mesajlar",
            "Kısa ve net mesajlar",
            "Uzun paragraflar",
            "Sadece önemli şeyleri yazar",
            "Sesli mesaj atar",
        ],
    },
    {
        id: "q5",
        text: "karakter olarak hangisine daha yakındır?",
        options: ["Planlı", "Spontane", "Kararsız", "Duruma göre değişir"],
    },
    {
        id: "q6",
        text: "günün hangi saatinde daha enerjik olur?",
        options: ["Sabah erken", "Öğlen", "Gece geç"],
    },
    {
        id: "q7",
        text: "bir plan iptal olduğunda en çok nasıl hisseder?",
        options: ["Rahatlar", "Üzülür", "Umursamaz", "Hemen yeni plan yapar"],
    },
    {
        id: "q8",
        text: "evcil hayvan olarak hangisine daha yakındır?",
        options: ["Kedi", "Köpek"],
    },
    {
        id: "q9",
        text: "önemli bir şey anlatırken hangi iletişim şeklini kullanır?",
        options: ["Sesli mesaj", "Uzun yazılı mesaj", "Telefon araması", "Yüz yüze konuşma"],
    },
    {
        id: "q10",
        text: "birlikte zaman geçirirken en çok hangisini tercih eder?",
        options: ["Sakin kafede oturmak", "Kalabalık bir yere gitmek", "Evde buluşmak", "Dışarıda yürüyüş"],
    },
    {
        id: "q11",
        text: "kararsız kaldığında genellikle ne yapar?",
        options: ["Yakın arkadaşına sorar", "Kendi kendine düşünür", "Bekler", "İnternetten araştırır"],
    },
    {
        id: "q12",
        text: "uyku düzeni nasıldır?",
        options: ["Erken uyur", "Geç uyur", "Düzensiz uyur", "Fırsat buldukça uyur"],
    },
    {
        id: "q13",
        text: "internette en çok hangi tür içerikleri izler?",
        options: ["Vlog", "Eğitici videolar", "Komik videolar", "Dizi/film sahneleri"],
    },
    {
        id: "q14",
        text: "hediye seçerken neye önem verir?",
        options: ["Anlamlı olmasına", "İşe yaramasına", "Eğlenceli olmasına"],
    },
    {
        id: "q15",
        text: "birlikte geçirilen zamanlardan hangisini özel bulur?",
        options: [
            "Uzun sohbetleri",
            "Birlikte bir şeyler izlemeyi",
            "Yeni yer keşfetmeyi",
            "Kısa ama samimi buluşmaları",
        ],
    },
    {
        id: "q16",
        text: "sosyal olarak hangisine yakındır?",
        options: ["İçe dönük", "Dışa dönük", "İkisi arası", "Duruma göre değişir"],
    },
    {
        id: "q17",
        text: "önemli bir gün yaklaştığında nasıl davranır?",
        options: [
            "Her şeyi planlar",
            "Son ana bırakır",
            "Başkası karar versin ister",
            "O an ne isterse onu yapar",
        ],
    },
    {
        id: "q18",
        text: "en çok hangi emojiyi kullanır?",
        options: ["😂", "🥲", "😍", "🤔"],
    },
    {
        id: "q19",
        text: "sabah uyandığında ilk ne yapar?",
        options: ["Telefona bakar", "Mesajlara cevap verir", "Müzik açar", "Bir süre yatakta kalır"],
    },
    {
        id: "q20",
        text: "bir sorunla karşılaştığında ilk tepkisi ne olur?",
        options: ["Panikler", "Sakinleşmeye çalışır", "Birine danışır", "Ertelemeye çalışır", "Şakaya vurur"],
    },
];

export default function CreatePage() {
    const [remainingQueue, setRemainingQueue] = useState<Question[]>(() => [...questionPool]);
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
    const [showCustomEditor, setShowCustomEditor] = useState(false);
    const [customQuestionText, setCustomQuestionText] = useState("");
    const [customOptions, setCustomOptions] = useState<string[]>(Array(MIN_CUSTOM_OPTIONS).fill(""));
    const [customQuestions, setCustomQuestions] = useState<
        Array<{
            id: string;
            text: string;
            options: string[];
        }>
    >([]);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [showSharePanel, setShowSharePanel] = useState(false);
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

    // isim + akış kontrolü
    const [creatorName, setCreatorName] = useState("");
    const [hasStarted, setHasStarted] = useState(false);

    // testi kaydetme + hata
    const [savingTest, setSavingTest] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // gözden geçirme paneli ve "Testi tamamla" popup'ı
    const [showReviewPanel, setShowReviewPanel] = useState(false);
    const [showConfirmPanel, setShowConfirmPanel] = useState(false);

    const currentQuestion = useMemo(() => remainingQueue[0], [remainingQueue]);

    const questionLookup = useMemo(() => {
        const map = new Map<string, Question>();
        questionPool.forEach((q) => map.set(q.id, q));
        customQuestions.forEach((q) => map.set(q.id, q));
        return map;
    }, [customQuestions]);

    const isComplete = useMemo(
        () => selectedQuestions.length >= MAX_SELECTION,
        [selectedQuestions.length]
    );

    const handleSelect = (option: string) => {
        if (!currentQuestion || isComplete) return;

        setSelectedQuestions((prev) => [
            ...prev,
            { questionId: currentQuestion.id, text: currentQuestion.text, answer: option },
        ]);

        setRemainingQueue((prev) => prev.slice(1));
    };

    const handleSkip = () => {
        setRemainingQueue((prev) => {
            if (prev.length <= 1) return prev;
            const [first, ...rest] = prev;
            return [...rest, first];
        });
    };

    const handleCancelCustom = () => {
        setShowCustomEditor(false);
        setCustomQuestionText("");
        setCustomOptions(Array(MIN_CUSTOM_OPTIONS).fill(""));
    };

    const handleAddCustomOption = () => {
        setCustomOptions((prev) => [...prev, ""]);
    };

    const handleRemoveCustomOption = (index: number) => {
        setCustomOptions((prev) => {
            if (prev.length <= MIN_CUSTOM_OPTIONS) return prev;
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSaveCustom = () => {
        const questionText = customQuestionText.trim();
        if (!questionText) return;

        const parsedOptions = customOptions.map((opt) => opt.trim()).filter(Boolean);

        if (parsedOptions.length < MIN_CUSTOM_OPTIONS) {
            alert(`En az ${MIN_CUSTOM_OPTIONS} dolu seçenek eklemelisin.`);
            return;
        }

        const newId = `custom-${customQuestions.length + 1}`;
        const newQuestion: Question = { id: newId, text: questionText, options: parsedOptions };

        setCustomQuestions((prev) => [...prev, newQuestion]);
        setRemainingQueue((prev) => [newQuestion, ...prev]);
        handleCancelCustom();
    };

    const handleStart = () => {
        if (!creatorName.trim()) {
            setSaveError("Önce adını yazmalısın.");
            return;
        }
        setSaveError(null);
        setHasStarted(true);
    };

    const handleCreateTest = async () => {
        if (selectedQuestions.length < MAX_SELECTION) return;
        if (!creatorName.trim()) {
            setSaveError("Önce adını yazmalısın.");
            return;
        }

        setSavingTest(true);
        setSaveError(null);

        const code = Math.random().toString(36).slice(2, 8).toUpperCase();

        const questionsPayload = selectedQuestions.map((item) => {
            const info = questionLookup.get(item.questionId);
            return {
                id: item.questionId,
                text: info?.text ?? item.text,
                options: info?.options ?? [],
                answer: item.answer,
            };
        });

        const { error } = await supabase.from("tests").insert({
            id: code,
            creator_name: creatorName.trim(),
            questions: questionsPayload,
        });

        if (error) {
            console.error(error);
            setSaveError("Test kaydedilirken bir hata oluştu. Lütfen tekrar dene.");
            setSavingTest(false);
            return;
        }

        // 👉 BU CİHAZ İÇİN LOCALSTORAGE'A DA KAYDET
        addStoredTest({
            id: code,
            creatorName: creatorName.trim(),
            createdAt: new Date().toISOString(),
        });

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const link = origin ? `${origin}/test/${code}` : `/test/${code}`;

        setShareLink(link);
        setShowSharePanel(true);
        setCopyStatus("idle");
        setSavingTest(false);
    };

    const handleCopyLink = async () => {
        if (!shareLink) return;
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopyStatus("copied");
        } catch {
            setCopyStatus("idle");
        }
    };

    return (
        <>
            <div className="min-h-screen app-bg app-text-main">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:flex-row">
                    <div className="flex-1 space-y-6 rounded-3xl border app-card bg-white/80 p-8 shadow-sm backdrop-blur">
                        {!hasStarted ? (
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] app-text-muted">
                                        Arkadaşlık testi
                                    </p>
                                    <h1 className="text-3xl font-bold app-text-main">
                                        Testini hazırlamaya başla
                                    </h1>
                                    <p className="text-sm app-text-muted">
                                        Önce testin kime ait olduğunu seçelim. Sonra senin hakkında sorulardan
                                        oluşan testi hazırlayacağız.
                                    </p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold app-text-main">
                                        Bu testi kim hazırlıyor? (Adın)
                                    </label>
                                    <input
                                        value={creatorName}
                                        onChange={(e) => setCreatorName(e.target.value)}
                                        placeholder="Adını yaz"
                                        className="w-full rounded-xl border app-card-soft px-3 py-2 text-sm app-text-main outline-none transition focus:ring-2"
                                    />
                                    <p className="text-[11px] app-text-muted">
                                        Testi çözen arkadaşların, bu isme göre kimin testini çözdüklerini görecek.
                                    </p>
                                    {saveError && (
                                        <p className="text-[11px] text-red-600 mt-1">{saveError}</p>
                                    )}
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={handleStart}
                                        disabled={!creatorName.trim()}
                                        className="w-full rounded-full app-btn-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Başla
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-2">
                                    <p className="text-sm font-semibold uppercase tracking-[0.16em] app-text-muted">
                                        Seçilen soru: {selectedQuestions.length} / {MAX_SELECTION}
                                    </p>
                                    <h1 className="text-3xl font-bold app-text-main">
                                        Arkadaşlık testini oluştur
                                    </h1>
                                    <p className="text-sm app-text-muted">
                                        Sorular senin hakkında olacak. Arkadaşların bu cevaplarını tahmin etmeye
                                        çalışacak.
                                    </p>
                                </div>

                                <div className="rounded-2xl border app-card-soft p-6 shadow-inner">
                                    {!currentQuestion && !showCustomEditor && (
                                        <div className="flex flex-col items-start gap-3">
                                            <h2 className="text-xl font-semibold app-text-main">
                                                Havuzdaki sorular bitti.
                                            </h2>
                                            <p className="text-sm app-text-muted">
                                                Örnek havuz şimdilik sınırlı. Yeni sorular ekleyene kadar
                                                seçtiklerinle devam edebilirsin.
                                            </p>
                                        </div>
                                    )}

                                    {currentQuestion && !showCustomEditor && (
                                        <div className="space-y-5">
                                            <div className="space-y-1">
                                                <h2 className="text-xl font-bold app-text-main">
                                                    {creatorName} {currentQuestion.text}
                                                </h2>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {currentQuestion.options.map((option, index) => (
                                                    <button
                                                        key={`${option}-${index}`}
                                                        type="button"
                                                        onClick={() => handleSelect(option)}
                                                        disabled={isComplete}
                                                        className="group rounded-xl border app-card bg-white px-4 py-3 text-left font-semibold app-text-main transition hover:-translate-y-[1px] hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <span className="mt-1 block text-lg font-bold app-text-main">
                                                            {option}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>

                                            {isComplete && (
                                                <p className="rounded-lg border app-card bg-white px-3 py-2 text-sm font-semibold app-text-muted">
                                                    Maksimum 10 soruyu seçtin.
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {showCustomEditor && (
                                        <div className="space-y-4 rounded-xl border app-card bg-white p-5">
                                            <div>
                                                <p className="text-sm font-semibold uppercase tracking-[0.14em] app-text-muted">
                                                    Kendi sorunu yaz
                                                </p>
                                                <p className="mt-1 text-sm app-text-muted">
                                                    Bu test için özel bir soru ve seçeneklerini yaz. Sonra kaydedip
                                                    tıpkı diğer sorular gibi cevabını işaretleyeceksin.
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold app-text-main">
                                                    Soru metni
                                                </label>
                                                <textarea
                                                    value={customQuestionText}
                                                    onChange={(e) => setCustomQuestionText(e.target.value)}
                                                    placeholder="Soruyu buraya yaz..."
                                                    className="w-full rounded-xl border app-card-soft px-3 py-2 text-sm app-text-main outline-none transition focus:ring-2"
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-semibold app-text-main">
                                                    Seçenekler
                                                </label>
                                                <div className="space-y-2">
                                                    {customOptions.map((opt, idx) => (
                                                        <div key={idx} className="flex gap-2">
                                                            <input
                                                                value={opt}
                                                                onChange={(e) =>
                                                                    setCustomOptions((prev) => {
                                                                        const next = [...prev];
                                                                        next[idx] = e.target.value;
                                                                        return next;
                                                                    })
                                                                }
                                                                placeholder={`Seçenek ${idx + 1}`}
                                                                className="flex-1 rounded-xl border app-card-soft px-3 py-2 text-sm app-text-main outline-none transition focus:ring-2"
                                                            />
                                                            {customOptions.length > MIN_CUSTOM_OPTIONS && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomOption(idx)}
                                                                    className="rounded-xl border border-rose-200 bg-white px-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
                                                                >
                                                                    Sil
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={handleAddCustomOption}
                                                    className="mt-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300 hover:bg-rose-50"
                                                >
                                                    Seçenek ekle +
                                                </button>
                                                <p className="text-xs text-rose-700 mt-1">
                                                    En az {MIN_CUSTOM_OPTIONS} seçenek eklemelisin, istersen daha fazla
                                                    ekleyebilirsin.
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                                                    onClick={handleCancelCustom}
                                                >
                                                    İptal
                                                </button>
                                                <button
                                                    type="button"
                                                    className="rounded-full border border-rose-500 bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                                                    onClick={handleSaveCustom}
                                                >
                                                    Sorumu kaydet
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                                    {currentQuestion && !showCustomEditor && (
                                        <button
                                            type="button"
                                            onClick={handleSkip}
                                            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800 disabled:cursor-not-allowed disabled:opacity-50"
                                            disabled={remainingQueue.length <= 1 || isComplete}
                                        >
                                            Soruyu atla
                                        </button>
                                    )}
                                    {!showCustomEditor ? (
                                        <button
                                            type="button"
                                            onClick={() => setShowCustomEditor(true)}
                                            className="rounded-full border border-rose-500 bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:opacity-50"
                                            disabled={isComplete}
                                        >
                                            Kendi sorumu eklemek istiyorum
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled
                                            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-400"
                                        >
                                            Soru ekleme açık
                                        </button>
                                    )}
                                </div>

                                {isComplete && (
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPanel(true)}
                                            className="rounded-full bg-rose-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700"
                                        >
                                            Testi tamamla
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* "Testi tamamla" popup'ı */}
            {showConfirmPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                        onClick={() => setShowConfirmPanel(false)}
                    />
                    <div className="relative w-full max-w-md space-y-4 rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl shadow-rose-200/60">
                        <h4 className="text-lg font-bold text-rose-900">Testi tamamlama</h4>
                        <p className="text-sm text-rose-700">
                            Seçtiğin sorular hazır. İstersen önce gözden geçirebilir ya da direkt testi
                            hazırlayabilirsin.
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={() => {
                                    setShowConfirmPanel(false);
                                    setShowReviewPanel(true);
                                }}
                                className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:text-rose-800"
                            >
                                Soruları gözden geçir
                            </button>
                            <button
                                type="button"
                                onClick={async () => {
                                    setShowConfirmPanel(false);
                                    await handleCreateTest();
                                }}
                                className="rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
                            >
                                Testi hazırla
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Gözden geçirme popup'ı */}
            {hasStarted && showReviewPanel && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div
                        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
                        onClick={() => setShowReviewPanel(false)}
                    />
                    <div className="relative w-full max-w-md space-y-4 rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl shadow-rose-200/60">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-rose-900">Seçilen sorular</h3>
                                <span className="mt-1 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                    {selectedQuestions.length} / {MAX_SELECTION}
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowReviewPanel(false)}
                                className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300"
                            >
                                ×
                            </button>
                        </div>

                        {selectedQuestions.length === 0 ? (
                            <p className="text-sm text-rose-700">
                                Seçtiklerin burada listelenecek. Her bir seçenek tıklaması hem soruyu ekler hem de
                                senin cevabını kaydeder.
                            </p>
                        ) : (
                            <ul className="max-h-72 space-y-3 overflow-auto text-sm text-rose-900 pr-1">
                                {selectedQuestions.map((item, index) => {
                                    const info = questionLookup.get(item.questionId);
                                    const isCustom = item.questionId.startsWith("custom-");
                                    return (
                                        <li
                                            key={`${item.questionId}-${index}`}
                                            className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-500">
                                                    Soru {index + 1}
                                                </p>
                                                {isCustom && (
                                                    <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-semibold text-rose-600">
                                                        Özel soru
                                                    </span>
                                                )}
                                            </div>
                                            <p className="font-semibold">{info?.text ?? item.text}</p>
                                            <p className="text-xs text-rose-700">Cevabın: {item.answer}</p>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        <div className="mt-2 space-y-2">
                            <button
                                type="button"
                                onClick={handleCreateTest}
                                disabled={
                                    selectedQuestions.length < MAX_SELECTION ||
                                    !creatorName.trim() ||
                                    savingTest
                                }
                                className="w-full rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {savingTest
                                    ? "Test oluşturuluyor..."
                                    : selectedQuestions.length < MAX_SELECTION
                                        ? "Önce 10 soruyu tamamla"
                                        : !creatorName.trim()
                                            ? "Önce adını yaz"
                                            : "Testi hazırla"}
                            </button>
                            {saveError && (
                                <p className="text-[11px] text-red-600">
                                    {saveError}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Link popup'ı */}
            {showSharePanel && shareLink && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        {/* senin daha önceki süsler aynen duruyor */}
                    </div>
                    <div className="popup-pop relative w-full max-w-md space-y-4 overflow-hidden rounded-3xl border border-rose-200 bg-white p-6 shadow-2xl shadow-rose-200/60">
                        <div className="pointer-events-none absolute inset-0">
                            <span className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-white/35 blur-3xl animate-pulse" />
                            <span className="absolute -bottom-16 -right-8 h-52 w-52 rounded-full bg-white/25 blur-3xl animate-pulse" />
                            <span className="absolute inset-0 bg-gradient-to-br from-white/80 via-rose-50/25 to-white/10" />
                        </div>
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h4 className="text-lg font-bold text-rose-900">Testin hazır!</h4>
                                <p className="text-sm text-rose-700">Bu linki arkadaşlarınla paylaşabilirsin:</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowSharePanel(false)}
                                className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-semibold text-rose-700 hover:border-rose-300"
                            >
                                ×
                            </button>
                        </div>
                        <p className="break-all rounded-xl bg-rose-50 px-3 py-2 font-mono text-xs text-rose-800">
                            {shareLink}
                        </p>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={handleCopyLink}
                                className="w-full rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600"
                            >
                                {copyStatus === "copied" ? "Kopyalandı" : "Linki kopyala"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
