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
    options: string[];
    answer: string;
};


const MAX_SELECTION = 10;
const MIN_CUSTOM_OPTIONS = 2;

const questionPool: Question[] = [
    {
        id: "q1",
        text: "bir şey öğrenirken hangi yöntem ona daha uygundur?",
        options: [
            "Yazarak öğrenmek ✍️",
            "Görerek/takip ederek 👀",
            "Dinleyerek 🎧",
            "Uygulayarak/deneyerek 🛠️",
            "Anlatarak/başkasına öğreterek 🗣️",
        ],
    },
    {
        id: "q2",
        text: "hoşlandığı birini görünce genelde ne yapar?",
        options: [
            "Gülümser 😄",
            "Göz teması kaçırır 🙈",
            "Konuşmaya çalışır 💬",
            "Aşırı heyecanlanır 😳",
        ],
    },
    {
        id: "q3",
        text: "boş zamanlarında en çok ne yapar?",
        options: [
            "Müzik dinler 🎧",
            "Film/dizi izler 🎬",
            "Dışarı çıkar 🚶‍♀️",
            "Evde dinlenir 😌",
            "Oyun oynar 🎮",
            "Kitap okur 📚",
        ],
    },
    {
        id: "q4",
        text: "sabahları genelde nasıldır?",
        options: [
            "Hemen enerjik olur ⚡",
            "Yavaş açılır 😴",
            "Sessiz sakin olmak ister 🤐",
        ],
    },
    {
        id: "q5",
        text: "tatlı olarak en çok hangisini sever?",
        options: [
            "Çikolatalı tatlılar 🍫",
            "Şerbetli tatlılar 🍯",
            "Sütlü tatlılar 🍮",
            "Dondurma 🍨",
            "Meyveli tatlılar 🍓",
            "Pastalar/kekler 🍰",
        ],
    },
    {
        id: "q6",
        text: "genelde günde kaç saat uyur?",
        options: [
            "5 saatten az 😵",
            "5–7 saat 😴",
            "7–9 saat 😌",
            "9 saatten fazla 🛌",
        ],
    },
    {
        id: "q7",
        text: "kısa bir tatil için hangisini seçer?",
        options: [
            "Deniz tatili 🏖️",
            "Doğa/orman 🌲",
            "Şehir gezisi 🏙️",
            "Evde dinlenmek 😌",
            "Kar/kış tatili, dağ evi ⛄🏔️",
        ],
    },
    {
        id: "q8",
        text: "en çok hangi film türlerini sever?",
        options: [
            "Romantik ❤️",
            "Komedi 😂",
            "Aksiyon 💥",
            "Korku 👻",
            "Bilim kurgu 🚀",
            "Dram 🎭",
        ],
    },
    {
        id: "q9",
        text: "en çok hangisiyle rahatlar?",
        options: [
            "Yürüyüş 🚶‍♀️",
            "Müzik 🎧",
            "Duş 🛁",
            "Uzanmak 😌",
            "Sessizlik 🌙",
        ],
    },
    {
        id: "q10",
        text: "hangi hayvana daha yakın hisseder?",
        options: ["Kedi 🐱", "Köpek 🐶", "Kuş 🐦", "Balık 🐠", "Hamster 🐹"],
    },
    {
        id: "q11",
        text: "nasıl bir aşk hikayesini daha çok ister?",
        options: [
            "Arkadaşlıktan aşka 💗",
            "Tesadüfen tanışma 🍀",
            "Okulda başlayan aşk 🎒",
            "Sosyal medyada başlayan 💬",
        ],
    },

    {
        id: "q12",
        text: "en çok hangi tür müzikleri sever?",
        options: ["Pop 🎵", "Rap 🎤", "Rock 🎸", "R&B/Soul 🎶", "Lofi/yavaş 🌙"],
    },
    {
        id: "q13",
        text: "içecek olarak en çok hangisini sever?",
        options: ["Kahve ☕", "Çay 🍵", "Su 💧", "Meyve suyu 🍹", "Gazlı içecek 🥤"],
    },
    {
        id: "q14",
        text: "evde en çok nerede vakit geçirmeyi sever?",
        options: [
            "Odasında 🛏️",
            "Salonda 🛋️",
            "Mutfakta 🍽️",
            "Balkonda/teras 🌿",
        ],
    },
    {
        id: "q15",
        text: "bir şey satın alırken nasıl karar verir?",
        options: [
            "Beğendiyse hemen alır ⚡",
            "Uzun uzun araştırır 🔍",
            "Yakınından fikir alır 🗣️",
            "İndirim bekler 🏷️",
        ],
    },
    {
        id: "q16",
        text: "hoşlandığı kişide en çok hangi özelliğe dikkat eder?",
        options: [
            "Gülüş 😄",
            "Gözler 👀",
            "Tarz/giysi 👗🧥",
            "Konuşma şekli 🗣️",
        ],
    },
    {
        id: "q17",
        text: "bir ortama girdiğinde ilk neyi fark eder?",
        options: [
            "Işık ve aydınlık 💡",
            "Düzen/temizlik 🧼",
            "Dekorasyon/renkler 🎨",
            "Ses seviyesi 🔊",
            "Koku 🌸",
        ],
    },
    {
        id: "q18",
        text: "hangi mevsimi daha çok sever?",
        options: ["Yaz ☀️", "Kış ❄️", "İlkbahar 🌸", "Sonbahar 🍂"],
    },
    {
        id: "q19",
        text: "dışarı çıktığında en çok nereye gitmeyi tercih eder?",
        options: [
            "Kafe ☕",
            "Park/yürüyüş alanı 🌿",
            "Alışveriş 🛍️",
            "Arkadaş buluşması 🤝",
        ],
    },
    {
        id: "q20",
        text: "için en çok enerji veren şey nedir?",
        options: [
            "Müzik 🎶",
            "Güzel hava ☀️",
            "Yemek/atıştırmalık 🍩",
            "Temiz bir ortam 🧼",
            "Sıcak bir içecek ☕",
        ],
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
    const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

    const toggleQuestionOpen = (id: string) => {
        setOpenQuestionId((prev) => (prev === id ? null : id));
    };

    const handleReviewAnswerChange = (questionId: string, newAnswer: string) => {
        setSelectedQuestions((prev) =>
            prev.map((q) =>
                q.questionId === questionId ? { ...q, answer: newAnswer } : q
            )
        );
    };

    const handleRemoveSelectedQuestion = (questionId: string) => {
        setSelectedQuestions((prev) =>
            prev.filter((q) => q.questionId !== questionId)
        );
        setOpenQuestionId((prev) => (prev === questionId ? null : prev));
    };

    const [createdTestCode, setCreatedTestCode] = useState<string | null>(null);

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
            {
                questionId: currentQuestion.id,
                text: currentQuestion.text,
                options: currentQuestion.options, // 👈 eklendi
                answer: option,
            },
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

        // ✅ Eğer bu sayfa oturumunda zaten bir test oluşturduysak
        // yeniden Supabase'e insert YAPMA, aynı linki tekrar göster.
        if (createdTestCode) {
            const origin = typeof window !== "undefined" ? window.location.origin : "";
            const link = origin ? `${origin}/test/${createdTestCode}` : `/test/${createdTestCode}`;

            setShareLink(link);
            setShowSharePanel(true);
            setCopyStatus("idle");
            return;
        }

        setSavingTest(true);
        setSaveError(null);

        // Yeni test için tek seferlik code üret
        const code = Math.random().toString(36).slice(2, 8).toUpperCase();

        const questionsPayload = selectedQuestions.map((item) => {
            const info = questionLookup.get(item.questionId);
            const optionsFromState = item.options ?? [];
            const optionsFromPool = info?.options ?? [];
            return {
                id: item.questionId,
                text: info?.text ?? item.text,
                options: optionsFromState.length ? optionsFromState : optionsFromPool,
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

        // ✅ Bu cihaz testin "creator" cihazı
        localStorage.setItem(`creator:${code}`, "1");

        // 👉 Bu cihaz için localStorage'a da kaydet
        addStoredTest({
            id: code,
            creatorName: creatorName.trim(),
            createdAt: new Date().toISOString(),
        });


        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const link = origin ? `${origin}/test/${code}` : `/test/${code}`;

        // ✅ Artık bu oturumda bu testin tek kodu var
        setCreatedTestCode(code);

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
                                        💘 Arkadaşlık testi
                                    </p>

                                    <h1 className="text-3xl font-bold app-text-main">
                                        Testini hazırlamaya başla ✨
                                    </h1>

                                    <p className="text-base app-text-muted">
                                        🤝 Önce testin kime ait olduğunu seçelim.
                                        Sonra senin hakkında sorulardan oluşan testi hazırlayacağız. 🌷
                                    </p>

                                </div>

                                <div className="space-y-2">
                                    <label className="text-base font-semibold app-text-main">
                                        Bu testi kim hazırlıyor?
                                    </label>

                                    <input
                                        value={creatorName}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const formatted = val.charAt(0).toUpperCase() + val.slice(1);
                                            setCreatorName(formatted);
                                        }}
                                        placeholder="Adını yaz"
                                        className="w-full rounded-xl border app-card-soft px-3 py-2 text-sm app-text-main outline-none transition focus:ring-2"
                                    />

                                    <p className="text-sm app-text-muted">
                                        📌 Testi çözen arkadaşların bu isme göre kimin testini çözdüklerini görecek.
                                    </p>

                                    {saveError && (
                                        <p className="text-[11px] text-red-600 mt-1">⚠️ {saveError}</p>
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
                                    <p className="text-base app-text-muted">
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
                                                <h2 className="text-xl font-medium app-text-main">
                                                    {creatorName} {currentQuestion.text}
                                                </h2>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                                {currentQuestion.options.map((option, index) => (
                                                    <button
                                                        key={`${option}-${index}`}
                                                        type="button"
                                                        onClick={() => handleSelect(option)}
                                                        disabled={isComplete}
                                                        className="group w-full rounded-xl border app-card bg-white px-4 py-3 text-left font-semibold app-text-main transition hover:-translate-y-[1px] hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        <span className="mt-1 block text-base sm:text-lg font-light app-text-main whitespace-normal break-words">
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
                                                <p className="text-base font-semibold uppercase tracking-[0.14em] app-text-muted">
                                                    Kendi sorunu yaz
                                                </p>
                                                <p className="mt-1 text-base app-text-muted">
                                                    Bu test için özel bir soru ve seçeneklerini yaz. Sonra kaydedip
                                                    tıpkı diğer sorular gibi cevabını işaretleyeceksin.
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-base font-semibold app-text-main">
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
                                                <label className="text-base font-semibold app-text-main">
                                                    Seçenekler
                                                </label>
                                                <div className="space-y-2">
                                                    {customOptions.map((opt, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                                                        >
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
                                                                className="w-full sm:flex-1 rounded-xl border app-card-soft px-3 py-2 text-sm app-text-main outline-none transition focus:ring-2"
                                                            />
                                                            {customOptions.length > MIN_CUSTOM_OPTIONS && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomOption(idx)}
                                                                    className="sm:shrink-0 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
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
                                                    className="mt-2 rounded-full border border-rose-200 bg-white px-3 py-1 text-sm font-semibold text-rose-700 hover:border-rose-300 hover:bg-rose-50"
                                                >
                                                    Seçenek ekle +
                                                </button>
                                                <p className="text-sm text-rose-700 mt-1">
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
                                    const isOpen = openQuestionId === item.questionId;

                                    // Şıkları ya state'ten, ya pool'dan çek
                                    const options =
                                        (item.options && item.options.length > 0
                                            ? item.options
                                            : info?.options) ?? [];

                                    return (
                                        <li
                                            key={`${item.questionId}-${index}`}
                                            className="rounded-xl border border-rose-100 bg-rose-50/80"
                                        >
                                            {/* Üst kısım – başlık satırı (tıklandığında aç/kapa) */}
                                            <button
                                                type="button"
                                                onClick={() => toggleQuestionOpen(item.questionId)}
                                                className="flex w-full items-center justify-between px-3 py-2 text-left"
                                            >
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500">
                                                            Soru {index + 1}
                                                        </p>
                                                        {isCustom && (
                                                            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-semibold text-rose-600">
                                                                Özel soru
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-semibold">
                                                        {info?.text ?? item.text}
                                                    </p>
                                                    {item.answer && (
                                                        <p className="mt-1 text-[11px] text-rose-700">
                                                            Cevabın:{" "}
                                                            <span className="font-semibold">
                                                                {item.answer}
                                                            </span>
                                                        </p>
                                                    )}
                                                </div>
                                                <span className="ml-2 text-xs text-rose-500">
                                                    {isOpen ? "▲" : "▼"}
                                                </span>
                                            </button>

                                            {/* Alt kısım – açılınca görünen bölüm */}
                                            {isOpen && (
                                                <div className="border-t border-rose-100 bg-white/70 px-3 py-3 space-y-3">
                                                    {/* Cevabı değiştirme alanı */}
                                                    <div className="space-y-1">
                                                        <p className="text-[11px] font-semibold text-rose-700">
                                                            Cevabını değiştirmek istersen:
                                                        </p>
                                                        <div className="space-y-1">
                                                            {options.map((opt) => (
                                                                <label
                                                                    key={opt}
                                                                    className="flex items-center gap-2 text-xs text-rose-900 cursor-pointer"
                                                                >
                                                                    <input
                                                                        type="radio"
                                                                        name={item.questionId}
                                                                        value={opt}
                                                                        checked={item.answer === opt}
                                                                        onChange={() =>
                                                                            handleReviewAnswerChange(
                                                                                item.questionId,
                                                                                opt
                                                                            )
                                                                        }
                                                                        className="h-3 w-3"
                                                                    />
                                                                    <span>{opt}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Silme butonu */}
                                                    <div className="flex justify-end">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveSelectedQuestion(
                                                                    item.questionId
                                                                )
                                                            }
                                                            className="text-[11px] font-semibold text-red-500 hover:text-red-600"
                                                        >
                                                            Soruyu sil 🗑️
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
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
