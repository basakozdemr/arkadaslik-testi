"use client";

import { useMemo, useState } from "react";

type Question = {
  id: string;
  text: string;
  options: string[];
  answer?: string; // seed pool answers are illustrative; creator sets answers via selection
};

type SelectedQuestion = {
  questionId: string;
  text: string;
  answer: string;
};

const MAX_SELECTION = 10;
const DEFAULT_CUSTOM_OPTION_TEXT = "A\nB\nC\nD";
const DEFAULT_CUSTOM_OPTIONS = DEFAULT_CUSTOM_OPTION_TEXT.split("\n");

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
  const [customOptionText, setCustomOptionText] = useState(DEFAULT_CUSTOM_OPTION_TEXT);
  const [customQuestions, setCustomQuestions] = useState<
    Array<{
      id: string;
      text: string;
      options: string[];
    }>
  >([]);

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
    setCustomOptionText(DEFAULT_CUSTOM_OPTION_TEXT);
  };

  const handleSaveCustom = () => {
    const questionText = customQuestionText.trim();
    if (!questionText) return;

    const parsedOptions = customOptionText
      .split(/\n|,/)
      .map((opt) => opt.trim())
      .filter(Boolean);

    let computedOptions =
      parsedOptions.length >= 2 ? parsedOptions.slice(0, 4) : [...DEFAULT_CUSTOM_OPTIONS];

    while (computedOptions.length < 4) {
      computedOptions.push(DEFAULT_CUSTOM_OPTIONS[computedOptions.length]);
    }

    const newId = `custom-${customQuestions.length + 1}`;
    const newQuestion: Question = { id: newId, text: questionText, options: computedOptions };

    setCustomQuestions((prev) => [...prev, newQuestion]);
    // Put the new custom question at the front so it appears immediately
    setRemainingQueue((prev) => [newQuestion, ...prev]);
    handleCancelCustom();
  };

  return (
    <div className="min-h-screen bg-rose-50 text-rose-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:flex-row">
        <div className="flex-1 space-y-6 rounded-3xl border border-rose-100 bg-white/80 p-8 shadow-sm backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-500">
                Seçilen soru: {selectedQuestions.length} / {MAX_SELECTION}
              </p>
              <h1 className="mt-2 text-3xl font-bold text-rose-900">Arkadaşlık testini oluştur</h1>
              <p className="mt-2 text-sm text-rose-700">
                20 soruluk havuzdan 10 soruluk test hazırlayacaksın. Her soruda kendi
                doğru cevabını işaretleyeceksin.
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 sm:flex-row">
              {currentQuestion && (
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

          <div className="rounded-2xl border border-rose-100 bg-rose-50/70 p-6 shadow-inner">
            {!currentQuestion && !showCustomEditor && (
              <div className="flex flex-col items-start gap-3">
                <h2 className="text-xl font-semibold text-rose-900">Havuzdaki sorular bitti.</h2>
                <p className="text-sm text-rose-700">
                  Örnek havuz şimdilik sınırlı. Yeni sorular ekleyene kadar seçtiklerinle devam
                  edebilirsin.
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
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleSelect(option)}
                      disabled={isComplete}
                      className="group rounded-xl border border-rose-200 bg-white px-4 py-3 text-left font-semibold text-rose-900 transition hover:-translate-y-[1px] hover:border-rose-300 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="block text-sm text-rose-700">Bu soruda cevabım</span>
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
                  <textarea
                    value={customOptionText}
                    onChange={(e) => setCustomOptionText(e.target.value)}
                    placeholder={"Her satıra bir seçenek yazabilirsin. Örneğin: A\nB\nC\nD"}
                    className="w-full rounded-xl border border-rose-200 bg-rose-50/60 px-3 py-2 text-sm text-rose-900 outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-100"
                    rows={4}
                  />
                  <p className="text-xs text-rose-700">
                    Her satıra bir seçenek yazabilirsin. Örneğin: A
                    <br />
                    B
                    <br />
                    C
                    <br />
                    D
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
                    key={item.questionId + item.answer + index}
                    className="rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-rose-500">
                        {item.questionId}
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
        </aside>
      </div>
    </div>
  );
}
