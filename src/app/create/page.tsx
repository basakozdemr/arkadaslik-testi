"use client";

import { useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

type Question = {
    id: string;
    text: string;
    options: string[];
    answer?: string; // seed answers only for demo; creator sets answers via selection
};

type SelectedQuestion = {
    questionId: string;
    text: string;
    answer: string;
};

const MAX_SELECTION = 10;
const DEFAULT_CUSTOM_OPTIONS = ["", "", "", ""];

const questionPool: Question[] = [
    {
        id: "q1",
        text: "Hafta sonu planın nedir?",
        options: ["Evde film gecesi", "Doğa yürüyüşü", "Arkadaşlarla brunch", "Şehirden kaçış"],
        answer: "Doğa yürüyüşü",
    },
    {
        id: "q2",
        text: "Kahveni nasıl içersin?",
        options: ["Sade", "Sütlü", "Soğuk kahve", "Filtre kahve"],
        answer: "Sade",
    },
    {
        id: "q3",
        text: "En çok hangi müzik türünü dinlersin?",
        options: ["Indie", "Pop", "Lo-fi", "Rock"],
        answer: "Indie",
    },
    {
        id: "q4",
        text: "Tatilde önceliğin?",
        options: ["Deniz-kum-güneş", "Yeni şehir keşfi", "Yemek turu", "Doğa kampı"],
        answer: "Yeni şehir keşfi",
    },
    {
        id: "q5",
        text: "Akşam yemeği seçiminde hangisi seni anlatır?",
        options: ["Evde şef modu", "Yeni restoran denemek", "Sokak lezzetleri", "Hızlı atıştırmalık"],
        answer: "Yeni restoran denemek",
    },
    {
        id: "q6",
        text: "Günün hangi zamanı en verimli hissedersin?",
        options: ["Sabah erken", "Öğlen", "Akşamüstü", "Gece geç"],
        answer: "Sabah erken",
    },
    {
        id: "q7",
        text: "Hangi aktivite seni rahatlatarak mutlu eder?",
        options: ["Meditasyon", "Kitap okumak", "Uzun yürüyüş", "Müzik dinlemek"],
        answer: "Kitap okumak",
    },
    {
        id: "q8",
        text: "Hangi dizi türünü açmayı tercih edersin?",
        options: ["Komedi", "Suç/gizem", "Drama", "Bilim kurgu"],
        answer: "Suç/gizem",
    },
    {
        id: "q9",
        text: "Evcil hayvan seçiminde hangisini öne alırsın?",
        options: ["Kedi", "Köpek", "Kuş", "Balık"],
        answer: "Kedi",
    },
    {
        id: "q10",
        text: "Yeni biriyle tanışırken ilk dikkat ettiğin şey?",
        options: ["Gülümseme", "Konuşma tarzı", "Ortak ilgi alanları", "Vücut dili"],
        answer: "Konuşma tarzı",
    },
    {
        id: "q11",
        text: "Sporda motivasyon kaynağın?",
        options: ["Yüksek tempolu müzik", "Partnerle çalışmak", "Hedef listesi", "Yeni ekipman"],
        answer: "Hedef listesi",
    },
    {
        id: "q12",
        text: "Telefonunda en çok kullandığın özellik?",
        options: ["Notlar", "Müzik/podcast", "Haritalar", "Takvim"],
        answer: "Notlar",
    },
];

export default function CreatePage() {
    const [remainingQueue, setRemainingQueue] = useState<Question[]>(() => [...questionPool]);
    const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
    const [showCustomEditor, setShowCustomEditor] = useState(false);
    const [customQuestionText, setCustomQuestionText] = useState("");
    const [customOptions, setCustomOptions] = useState<string[]>([...DEFAULT_CUSTOM_OPTIONS]);
    const [customQuestions, setCustomQuestions] = useState<
        Array<{
            id: string;
            text: string;
            options: string[];
        }>
    >([]);
    const [testId, setTestId] = useState<string | null>(null);
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [showSharePanel, setShowSharePanel] = useState(false);
    const [copyStatus, setCopyStatus] = useState<"idle" | "copied">("idle");

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
        setCustomOptions([...DEFAULT_CUSTOM_OPTIONS]);
    };

    const handleSaveCustom = () => {
        const questionText = customQuestionText.trim();
        if (!questionText) return;

        const parsedOptions = customOptions.map((opt) => opt.trim()).filter(Boolean);

        let computedOptions =
            parsedOptions.length >= 2 ? parsedOptions.slice(0, 4) : [...DEFAULT_CUSTOM_OPTIONS];

        while (computedOptions.length < 4) {
            computedOptions.push(DEFAULT_CUSTOM_OPTIONS[computedOptions.length]);
        }

        const newId = `custom-${customQuestions.length + 1}`;
        const newQuestion: Question = { id: newId, text: questionText, options: computedOptions };

        setCustomQuestions((prev) => [...prev, newQuestion]);
        setRemainingQueue((prev) => [newQuestion, ...prev]); // custom question comes next
        handleCancelCustom();
    };

    const handleCreateTest = async () => {
        if (selectedQuestions.length < MAX_SELECTION) return;

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
            questions: questionsPayload,
        });

        if (error) {
            alert("Test oluşturulurken bir hata oluştu.");
            console.error(error);
            return;
        }

        setTestId(code);

        const origin = typeof window !== "undefined" ? window.location.origin : "";
        const link = origin ? `${origin}/test/${code}` : `/test/${code}`;

        setShareLink(link);
        setShowSharePanel(true);
        setCopyStatus("idle");
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
            <div className="min-h-screen bg-rose-50 text-rose-950">
                <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:flex-row">
                    <div className="flex-1 space-y-6 rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-sm backdrop-blur">
                        <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">
                                Seçilen soru: {selectedQuestions.length} / {MAX_SELECTION}
                            </p>
                            <h1 className="text-3xl font-bold text-rose-900">Arkadaşlık testini oluştur</h1>
                            <p className="text-sm text-rose-700">
                                20 soruluk havuzdan 10 soruluk test hazırlayacaksın. Her soruda kendi doğru cevabını
                                işaretleyeceksin.
                            </p>
                        </div>

                        <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-6 shadow-inner">
                            {!currentQuestion && !showCustomEditor && (
                                <div className="flex flex-col items-start gap-3">
                                    <h2 className="text-xl font-semibold text-rose-900">Havuzdaki sorular bitti.</h2>
                                    <p className="text-sm text-rose-700">
                                        Örnek havuz şimdilik sınırlı. Yeni sorular ekleyene kadar seçtiklerinle
                                        devam edebilirsin.
                                    </p>
                                </div>
                            )}

                            {currentQuestion && !showCustomEditor && (
                                <div className="space-y-5">
                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-rose-500">Soru kuyruğu</p>
                                        <h2 className="text-xl font-bold text-rose-900">{currentQuestion.text}</h2>
                                    </div>

                                    <div className="grid gap-3 sm:grid-cols-2">
                                        {currentQuestion.options.map((option, index) => (
                                            <button
                                                key={`${option}-${index}`}
                                                type="button"
                                                onClick={() => handleSelect(option)}
                                                disabled={isComplete}
                                                className="group rounded-xl border border-rose-200 bg-white px-4 py-3 text-left font-semibold text-rose-900 transition hover:-translate-y-[1px] hover:border-rose-300 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <span className="mt-1 block text-lg font-bold text-rose-900">{option}</span>
                                            </button>
                                        ))}
                                    </div>

                                    {isComplete && (
                                        <p className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700">
                                            Maksimum 10 soruyu seçtin. Sağdaki listede özetini görebilirsin.
                                        </p>
                                    )}
                                </div>
                            )}

                            {showCustomEditor && (
                                <div className="space-y-4 rounded-xl border border-rose-100 bg-white p-5">
                                    <div>
                                        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-rose-500">
                                            Kendi sorunu yaz
                                        </p>
                                        <p className="mt-1 text-sm text-rose-700">
                                            Bu test için özel bir soru ve seçeneklerini yaz. Sonra kaydedip tıpkı diğer
                                            sorular gibi cevabını işaretleyeceksin.
                                        </p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-rose-900">Soru metni</label>
                                        <textarea
                                            value={customQuestionText}
                                            onChange={(e) => setCustomQuestionText(e.target.value)}
                                            placeholder="Arkadaşlığınızı en iyi anlatan soruyu yaz..."
                                            className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                            rows={3}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-rose-900">Seçenekler</label>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            {customOptions.map((opt, idx) => (
                                                <input
                                                    key={idx}
                                                    value={opt}
                                                    onChange={(e) =>
                                                        setCustomOptions((prev) => {
                                                            const next = [...prev];
                                                            next[idx] = e.target.value;
                                                            return next;
                                                        })
                                                    }
                                                    placeholder={`Seçenek ${idx + 1}`}
                                                    className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-rose-700">Toplam 4 seçenek ekleyebilirsin.</p>
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
                    </div>

                    <aside className="w-full max-w-sm space-y-4 rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm backdrop-blur">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-rose-900">Seçilen sorular</h3>
                            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                                {selectedQuestions.length} / {MAX_SELECTION}
                            </span>
                        </div>

                        {selectedQuestions.length === 0 ? (
                            <p className="text-sm text-rose-700">
                                Seçtiklerin burada listelenecek. Her bir seçenek tıklaması hem soruyu ekler hem de
                                senin cevabını kaydeder.
                            </p>
                        ) : (
                            <ul className="space-y-3 text-sm text-rose-900">
                                {selectedQuestions.map((item, index) => {
                                    const info = questionLookup.get(item.questionId);
                                    const isCustom = item.questionId.startsWith("custom-");
                                    return (
                                        <li
                                            key={`${item.questionId}-${index}`}
                                            className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2"
                                        >
                                            <div className="flex items-center justify_between">
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

                        <div className="mt-4 space-y-3 rounded-2xl border border-rose-100 bg-rose-50/80 p-4">
                            <h4 className="text-base font-bold text-rose-900">Testi oluştur</h4>
                            <p className="text-sm text-rose-700">
                                Seçtiğin 10 soruya göre arkadaşlarınla paylaşabileceğin bir test linki oluştur.
                            </p>
                            <button
                                type="button"
                                onClick={handleCreateTest}
                                disabled={selectedQuestions.length < MAX_SELECTION}
                                className="w-full rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {selectedQuestions.length < MAX_SELECTION
                                    ? "Önce 10 soruyu tamamla"
                                    : "Testi oluştur"}
                            </button>
                        </div>
                    </aside>
                </div>
            </div>

            {showSharePanel && shareLink && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" />
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <span className="absolute left-1/4 top-1/4 h-2 w-2 rounded-full bg-white/80 blur-[2px] animate-ping" />
                        <span className="absolute right-1/4 top-1/2 h-3 w-3 rounded-full bg-white/70 blur-[2px] animate-[ping_1.6s_ease-in-out_infinite]" />
                        <span className="absolute left-1/2 bottom-1/3 h-2.5 w-2.5 rounded-full bg-white/70 blur-[1px] animate-[ping_1.8s_ease-in-out_infinite]" />
                        <span className="absolute right-1/3 bottom-1/4 h-2 w-2 rounded-full bg-white/80 blur-[2px] animate-[ping_1.4s_ease-in-out_infinite]" />
                        <span className="absolute left-1/5 bottom-1/5 h-3 w-3 rounded-full bg-white/60 blur-[2px] animate-[ping_2s_ease-in-out_infinite]" />
                        <span className="absolute right-1/5 top-1/5 h-2 w-2 rounded-full bg-white/70 blur-[1px] animate-[ping_1.2s_ease-in-out_infinite]" />
                        <span className="absolute left-1/3 bottom-1/6 h-2 w-2 rounded-full bg-white/60 blur-[2px] animate-[ping_2.4s_ease-in-out_infinite]" />
                        <span className="absolute right-1/2 top-1/6 h-2 w-2 rounded-full bg-white/70 blur-[1px] animate-[ping_1.5s_ease-in-out_infinite]" />
                        <span className="absolute inset-x-1/2 top-1/2 h-1.5 w-1.5 rounded-full bg-white/70 blur-[1px] animate-[ping_1.3s_ease-in-out_infinite]" />
                        <span className="absolute left-8 top-10 h-1 w-1 rounded-full bg-white/60 blur-[1px]" />
                        <span className="absolute right-10 bottom-12 h-1 w-1 rounded-full bg-white/60 blur-[1px]" />
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
