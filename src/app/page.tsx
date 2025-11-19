"use client";

import { useMemo, useState } from "react";

const questionPool = [
  {
    id: "q1",
    text: "Sence bir arkadaşlıkta en önemli şey nedir?",
    options: ["Güven", "Eğlence", "Sadakat", "Özgürlük"],
    answer: "Güven",
  },
  {
    id: "q2",
    text: "Arkadaşınla hangi aktiviteyi yapmayı tercih edersin?",
    options: ["Kahve içmek", "Doğa yürüyüşü", "Film maratonu", "Oyun gecesi"],
    answer: "Film maratonu",
  },
  {
    id: "q3",
    text: "Sürprizleri sever misin?",
    options: ["Bayılırım", "Bazen", "Kararsızım", "Sevmem"],
    answer: "Bazen",
  },
  {
    id: "q4",
    text: "Tatilde nereye gitmek isterdin?",
    options: ["Sahil", "Dağ", "Şehir turu", "Kamp"],
    answer: "Sahil",
  },
  {
    id: "q5",
    text: "En çok hangi müzik türünü dinlersin?",
    options: ["Pop", "Rock", "Caz", "Lo-fi"],
    answer: "Lo-fi",
  },
  {
    id: "q6",
    text: "Birlikte izlemeyi en sevdiğin tür?",
    options: ["Komedi", "Bilim kurgu", "Drama", "Belgesel"],
    answer: "Bilim kurgu",
  },
  {
    id: "q7",
    text: "Hangi saatlerde daha enerjiksin?",
    options: ["Sabah", "Öğlen", "Akşam", "Gece"],
    answer: "Akşam",
  },
  {
    id: "q8",
    text: "En sevdiğin kutlama tarzı?",
    options: ["Sessiz bir yemek", "Kalabalık parti", "Doğa kaçamağı", "Oyun turnuvası"],
    answer: "Sessiz bir yemek",
  },
  {
    id: "q9",
    text: "En sık kullandığın emoji?",
    options: ["😂", "🤔", "😍", "😴"],
    answer: "😂",
  },
  {
    id: "q10",
    text: "Arkadaşına en çok ne söylerken yakalanırsın?",
    options: ["Hadi buluşalım", "Çok yoruldum", "Bunu duydun mu?", "Acıktım"],
    answer: "Hadi buluşalım",
  },
  {
    id: "q11",
    text: "Hangi tarzda mesajlaşmayı seversin?",
    options: ["Sesli", "Emoji dolu", "Uzun paragraflar", "Sadece önemli şeyler"],
    answer: "Emoji dolu",
  },
  {
    id: "q12",
    text: "Birlikte geçirdiğiniz en güzel zaman neredeydi?",
    options: ["Kafe", "Sahil", "Konser", "Evde"],
    answer: "Konser",
  },
  {
    id: "q13",
    text: "Arkadaşın seni nasıl tanımlar?",
    options: ["Macera dolu", "Planlı", "Sakin", "Pratik"],
    answer: "Planlı",
  },
  {
    id: "q14",
    text: "Favori dizi türün?",
    options: ["Sitcom", "Gerilim", "Kore dizisi", "Animasyon"],
    answer: "Gerilim",
  },
  {
    id: "q15",
    text: "Birlikte en çok neyi konuşuyorsunuz?",
    options: ["Hedefler", "Günlük hayat", "Dedikodu", "Spor"],
    answer: "Günlük hayat",
  },
  {
    id: "q16",
    text: "Hafta sonunu nasıl geçirmek istersin?",
    options: ["Dışarıda", "Evde dinlenerek", "Seyahat ederek", "Aileyle"],
    answer: "Evde dinlenerek",
  },
  {
    id: "q17",
    text: "Arkadaşının doğum günü için tercih edeceğin hediye?",
    options: ["Kitap", "Teknoloji", "Deneyim", "El yapımı"],
    answer: "Deneyim",
  },
  {
    id: "q18",
    text: "En sevdiğin iletişim şekli?",
    options: ["Yüz yüze", "Telefon", "Video", "Mesaj"],
    answer: "Yüz yüze",
  },
  {
    id: "q19",
    text: "Birlikte ne öğrenmek isterdin?",
    options: ["Yemek", "Dans", "Müzik", "Dil"],
    answer: "Yemek",
  },
  {
    id: "q20",
    text: "Günün hangi saatinde konuşmayı seversin?",
    options: ["Sabah erken", "Öğleden sonra", "Akşamüstü", "Gece geç"],
    answer: "Akşamüstü",
  },
] as const;

const sampleScoreboard = [
  { name: "Ece", score: 8 },
  { name: "Mert", score: 7 },
  { name: "Selin", score: 9 },
  { name: "Yiğit", score: 6 },
];

const MAX_SELECTION = 10;

export default function Home() {
  const [view, setView] = useState<"home" | "create" | "solve">("home");
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [customOptions, setCustomOptions] = useState("A\nB\nC\nD");
  const [customAnswer, setCustomAnswer] = useState("A");
  const [customQuestions, setCustomQuestions] = useState<{
    id: string;
    text: string;
    options: string[];
    answer: string;
  }[]>([]);
  const [creatorAnswers, setCreatorAnswers] = useState<Record<string, string>>({});
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [solveLink, setSolveLink] = useState("");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [friendAnswers, setFriendAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [scoreboard, setScoreboard] = useState(sampleScoreboard);
  const [remainingQueue, setRemainingQueue] = useState<string[]>(questionPool.map((q) => q.id));

  const availableQuestions = useMemo(
    () => [...questionPool, ...customQuestions],
    [customQuestions]
  );

  const selectedData = availableQuestions.filter((q) => selectedQuestions.includes(q.id));

  const friendTest = useMemo(
    () => (selectedData.length === MAX_SELECTION ? selectedData : questionPool.slice(0, MAX_SELECTION)),
    [selectedData]
  );

  const selectionComplete = selectedQuestions.length >= MAX_SELECTION;
  const canGenerateLink = selectedQuestions.length === MAX_SELECTION;

  const currentQuestionId = selectionComplete ? null : remainingQueue[0];
  const currentQuestion = availableQuestions.find((q) => q.id === currentQuestionId);

  const neededCount = MAX_SELECTION - selectedQuestions.length;
  const skipDisabled = selectionComplete || !currentQuestion || remainingQueue.length <= neededCount;

  const handleCreatorAnswer = (answer: string) => {
    if (!currentQuestion || selectionComplete) return;

    setCreatorAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));

    if (!selectedQuestions.includes(currentQuestion.id) && selectedQuestions.length < MAX_SELECTION) {
      setSelectedQuestions((prev) => [...prev, currentQuestion.id]);
    }

    setRemainingQueue((prev) => {
      const [, ...rest] = prev;
      const updatedCount = selectedQuestions.includes(currentQuestion.id)
        ? selectedQuestions.length
        : selectedQuestions.length + 1;
      if (updatedCount >= MAX_SELECTION) {
        return [];
      }
      return rest;
    });
  };

  const handleSkipCurrent = () => {
    if (!currentQuestion || skipDisabled) return;
    setRemainingQueue((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  };

  const handleAddCustomQuestion = () => {
    if (selectedQuestions.length >= MAX_SELECTION) return;
    if (!customQuestion.trim()) return;
    const newId = `custom-${customQuestions.length + 1}`;
    const parsedOptions = customOptions
      .split(/\n|,/)
      .map((opt) => opt.trim())
      .filter(Boolean);
    const options = parsedOptions.length >= 2 ? parsedOptions : ["A", "B", "C", "D"];
    const answer = options.includes(customAnswer.trim()) ? customAnswer.trim() : options[0];

    const newQuestion = { id: newId, text: customQuestion.trim(), options, answer };
    setCustomQuestions((prev) => [...prev, newQuestion]);
    setCreatorAnswers((prev) => ({ ...prev, [newId]: answer }));
    setSelectedQuestions((prev) => {
      if (prev.length >= MAX_SELECTION) return prev;
      const updated = [...prev, newId];
      if (updated.length >= MAX_SELECTION) {
        setRemainingQueue([]);
        return updated;
      }
      return updated;
    });
    setRemainingQueue((prev) => prev.filter((id) => id !== newId));
    setCustomQuestion("");
    setCustomOptions("A\nB\nC\nD");
    setCustomAnswer(options[0]);
  };

  const handleGenerateLink = () => {
    if (!canGenerateLink) return;
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setGeneratedLink(`https://arkadaslik.app/test/${code}`);
    setCopied(false);
    setShowShareModal(true);
  };

  const handleCopy = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const handleAnswerFriend = (answer: string) => {
    const current = friendTest[currentQuestionIndex];
    setFriendAnswers({ ...friendAnswers, [current.id]: answer });
    if (currentQuestionIndex < friendTest.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const totalScore = friendTest.reduce((sum, question) => {
        const userAnswer = answerForQuestion(question.id, { ...friendAnswers, [current.id]: answer });
        return sum + (userAnswer === question.answer ? 1 : 0);
      }, 0);
      setScore(totalScore);
      setScoreboard((prev) => [{ name: "Sen", score: totalScore }, ...prev]);
    }
  };

  const answerForQuestion = (id: string, answersMap = friendAnswers) => answersMap[id];

  const resetStates = () => {
    setSelectedQuestions([]);
    setCreatorAnswers({});
    setGeneratedLink(null);
    setCustomQuestions([]);
    setCustomQuestion("");
    setCustomOptions("A\nB\nC\nD");
    setCustomAnswer("A");
    setSolveLink("");
    setCurrentQuestionIndex(0);
    setFriendAnswers({});
    setScore(null);
    setScoreboard(sampleScoreboard);
    setRemainingQueue(questionPool.map((q) => q.id));
  };

  const heroContent = {
    home: {
      title: "Arkadaşlık Testi Ana Sayfası",
      description:
        "Kendi sorunla arkadaşlarını sınayabilir ya da sana gönderilen linkle arkadaşının testini çözebilirsin. Sorular arasında geri dönüş yok; her adımda kararını ver ve ilerle!",
      emoji: "🏠",
      badge: "Genel bakış",
    },
    create: {
      title: "Testini Hazırla",
      description:
        "20 soruluk havuzdan 10 soru seç, dilersen kendi sorunla destekle. Cevaplarını işaretle, paylaşılabilir linki üret ve arkadaşlarına gönder.",
      emoji: "✍️",
      badge: "Oluşturma",
    },
    solve: {
      title: "Arkadaşının Testini Çöz",
      description:
        "Sana gelen linki yapıştır, soruları sırayla yanıtla ve geri dönmeden tamamla. Sonucunu skor tablosunda hemen gör!",
      emoji: "🧩",
      badge: "Çözüm",
    },
  } as const;

  const hero = heroContent[view];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 text-zinc-900">
      <header className="sticky top-0 z-20 border-b border-orange-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-lg font-semibold text-white shadow-lg shadow-orange-200">
              AT
            </div>
            <div>
              <p className="text-sm text-orange-600">Arkadaşlık Testi</p>
              <p className="text-lg font-semibold">Bağlarınızı ölçen mini oyun</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView("home")}
              className="rounded-full bg-white px-4 py-2 text-sm font-medium text-orange-700 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Ana sayfa
            </button>
            <button
              onClick={resetStates}
              className="rounded-full bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-md"
            >
              Baştan başla
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-xl shadow-orange-100/70 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-700">
              <span>{hero.emoji}</span>
              <span>{hero.badge}</span>
            </div>
            <h1 className="text-3xl font-semibold text-zinc-900">{hero.title}</h1>
            <p className="text-lg text-zinc-600">{hero.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <button
                onClick={() => setView("create")}
                className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50 p-5 text-left transition hover:-translate-y-1 hover:border-orange-200 hover:bg-orange-100"
              >
                <div>
                  <p className="text-sm font-semibold text-orange-600">Kendi testini hazırla</p>
                  <p className="text-base text-zinc-700">20 soruluk havuzdan 10 soru seç, cevabını işaretle, paylaşılabilir linkini al.</p>
                </div>
                <span className="text-3xl">✍️</span>
              </button>
              <button
                onClick={() => setView("solve")}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white p-5 text-left transition hover:-translate-y-1 hover:border-orange-200"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-800">Arkadaşının testini çöz</p>
                  <p className="text-base text-zinc-700">Linki kutucuğa yapıştır, soruları tek tek yanıtla, skor tablosunda yerini al.</p>
                </div>
                <span className="text-3xl">🧩</span>
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-6 shadow-inner shadow-orange-100">
            <p className="text-sm font-semibold text-orange-700">Süreç Özeti</p>
            <ul className="mt-3 space-y-2 text-sm text-orange-800">
              <li>• Ana sayfada ister test hazırla ister test çöz adımını seç.</li>
              <li>• Test hazırlarken 20 soruluk havuzdan 10 soru işaretle veya kendi sorun.</li>
              <li>• Sorularını cevapladıktan sonra üretilen linki arkadaşlarına gönder.</li>
              <li>• Arkadaşların linke tıkladığında soruları geriye dönemeden çözer.</li>
              <li>• Tamamlayınca skor tablosunda tüm arkadaşların sonuçları görünür.</li>
            </ul>
          </div>
        </section>

        {view === "create" && (
          <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-xl shadow-orange-100/70 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold">Sorularını sırayla seç (20&apos;lik havuzdan 10&apos;u)</h2>
                  <p className="text-sm text-zinc-600">
                    Seçilen: {selectedQuestions.length}/{MAX_SELECTION} · Havuzda kalan soru: {remainingQueue.length}
                  </p>
                </div>
                <div className="space-y-2 text-right text-xs text-orange-700">
                  <div className="rounded-full bg-orange-100 px-4 py-1 text-sm font-medium text-orange-700">
                    Sorular tek tek gelir, cevapla veya atla.
                  </div>
                  <p className="text-xs text-orange-700">
                    Atladığın sorular kuyruğun sonuna gider ve tekrar karşına çıkar.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 p-5 shadow-inner shadow-orange-100">
                {selectionComplete ? (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-orange-700">10 soru hazır</p>
                    <p className="text-lg font-semibold text-zinc-900">Cevaplarını gözden geçir ve link üret.</p>
                    <p className="text-sm text-zinc-600">
                      Seçtiğin tüm sorular aşağıdaki listede. Dilersen cevaplarını değiştirebilir ya da özel sorular ekleyebilirsin.
                    </p>
                  </div>
                ) : currentQuestion ? (
                  <>
                    <div className="flex items-center justify-between text-sm text-orange-700">
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-orange-700">
                        Soru kuyruğu: {questionPool.length - remainingQueue.length + 1}/{questionPool.length}
                      </span>
                      <span className="rounded-full bg-white px-3 py-1 font-semibold text-orange-700">
                        Seçilen {selectedQuestions.length}/{MAX_SELECTION}
                      </span>
                    </div>
                    <div className="mt-4 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm">
                      <p className="text-base font-semibold text-zinc-900">{currentQuestion.text}</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {currentQuestion.options.map((option) => (
                          <button
                            key={option}
                            onClick={() => handleCreatorAnswer(option)}
                            className="rounded-xl border border-zinc-200 bg-orange-50 px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-100"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 flex flex-col gap-3 border-t border-orange-100 pt-3 text-xs text-orange-800 sm:flex-row sm:items-center sm:justify-between">
                        <p>Bu soruyu eklemek istemiyor musun? Atla dediğinde kuyruğun sonuna gider ve tekrar karşına çıkar.</p>
                        <button
                          onClick={handleSkipCurrent}
                          disabled={skipDisabled}
                          className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Soruyu atla
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-orange-700">Sorular sıraya alındı</p>
                    <p className="text-sm text-zinc-600">Atladığın sorularla kuyruğu tamamlıyoruz. Seçimini bitirmek için gelen soruları cevapla.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">Kendi sorumu yazmak istiyorum</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700">Ekstra</span>
                </div>
                <p className="text-sm text-zinc-600">Kuyruğa bağlı kalmadan özel sorunla testini tamamla.</p>
                <textarea
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Arkadaşlığı en iyi anlatan sorunu yaz..."
                  className="mt-3 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                />
                <label className="mt-3 block text-xs font-semibold text-zinc-700">Seçenekler (virgül veya satır ile)</label>
                <textarea
                  value={customOptions}
                  onChange={(e) => setCustomOptions(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-orange-400 focus:outline-none"
                />
                <label className="mt-2 block text-xs font-semibold text-zinc-700">Doğru cevap</label>
                <input
                  value={customAnswer}
                  onChange={(e) => setCustomAnswer(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs focus:border-orange-400 focus:outline-none"
                  placeholder="Örneğin: A veya ilk seçenekteki ifade"
                />
                <button
                  onClick={handleAddCustomQuestion}
                  className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  Soruyu ekle ve seçilenlere kat
                </button>
              </div>

              {selectedData.length > 0 && (
                <div className="rounded-2xl border border-orange-100 bg-orange-50/70 p-4">
                  <p className="font-semibold text-orange-700">Seçtiklerin ve cevapların</p>
                  <p className="text-xs text-orange-600">Cevapları değiştirebilir, özel sorularını görebilirsin.</p>
                  <div className="mt-3 max-h-[360px] space-y-3 overflow-y-auto pr-2">
                    {selectedData.map((question) => (
                      <div key={question.id} className="rounded-xl border border-orange-100 bg-white p-3">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-zinc-900">{question.text}</p>
                          <span className="rounded-full bg-orange-50 px-3 py-1 text-[10px] font-semibold uppercase text-orange-700">
                            {question.id.startsWith("custom") ? "Özel" : "Havuz"}
                          </span>
                        </div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-zinc-700">
                          {question.options.map((option) => (
                            <button
                              key={option}
                              onClick={() => setCreatorAnswers((prev) => ({ ...prev, [question.id]: option }))}
                              className={`rounded-lg border px-2 py-2 text-left transition ${creatorAnswers[question.id] === option
                                  ? "border-orange-400 bg-orange-50"
                                  : "border-zinc-200 hover:border-orange-200"
                                }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="font-semibold text-zinc-900">Link oluştur</p>
                <p className="text-sm text-zinc-600">10 soru seçildiğinde paylaşılabilir test linkin hazır olur.</p>
                <button
                  disabled={!canGenerateLink}
                  onClick={handleGenerateLink}
                  className="mt-3 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {canGenerateLink ? "Test linkini oluştur" : "Önce 10 soru seç"}
                </button>
                {generatedLink && (
                  <div className="mt-3 rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm">
                    <p className="font-semibold text-orange-700">Paylaşılabilir link</p>
                    <p className="break-all text-zinc-800">{generatedLink}</p>
                    <button
                      onClick={handleCopy}
                      className="mt-2 w-full rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5"
                    >
                      {copied ? "Kopyalandı" : "Linki kopyala"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {view === "solve" && (
          <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-xl shadow-orange-100/70 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-orange-700">Arkadaşının testini aç</p>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={solveLink}
                    onChange={(e) => setSolveLink(e.target.value)}
                    placeholder="Gönderilen linki buraya yapıştır"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  />
                  <button
                    onClick={() => setView("solve")}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5"
                  >
                    Testi aç
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-600">Linki tıklamak veya buraya yapıştırmak aynı sonucu verir.</p>
              </div>

              {score === null ? (
                <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-orange-700">Arkadaşının hazırladığı test</p>
                      <p className="text-xs text-zinc-500">Sorularda geri dönüş yok. Cevapla ve ilerle!</p>
                    </div>
                    <div className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                      Soru {currentQuestionIndex + 1}/10
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-orange-100 bg-orange-50 p-4">
                    <p className="text-base font-semibold text-zinc-900">
                      {friendTest[currentQuestionIndex].text}
                    </p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {friendTest[currentQuestionIndex].options.map((option) => (
                        <button
                          key={option}
                          onClick={() => handleAnswerFriend(option)}
                          className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-left text-sm font-medium text-zinc-800 transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50"
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-zinc-600">Seçtiğin cevap kaydedilir, önceki soruya dönüş yok.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-inner">
                  <p className="text-sm font-semibold text-orange-700">Test tamamlandı</p>
                  <p className="text-2xl font-bold text-zinc-900">Skorun: {score}/10</p>
                  <p className="mt-2 text-sm text-zinc-600">
                    Skor tablosunda anında görünürsün. Arkadaşının tüm sonuçlarını aşağıdan inceleyebilirsin.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-zinc-900">Arkadaşlarının skor tablosu</p>
                <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">Canlı</span>
              </div>
              <p className="mt-1 text-xs text-zinc-600">Test bitince yeni skor en üstte görünür.</p>
              <div className="mt-3 divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-zinc-50">
                {[...(score !== null ? scoreboard : sampleScoreboard)].map((entry, index) => (
                  <div
                    key={`${entry.name}-${index}`}
                    className="flex items-center justify-between px-4 py-3 text-sm font-medium text-zinc-800"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-orange-700">
                        {index + 1}
                      </span>
                      <span>{entry.name}</span>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-orange-700">
                      {entry.score}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {view === "home" && (
          <section className="grid gap-6 rounded-3xl bg-white p-8 shadow-xl shadow-orange-100/70 lg:grid-cols-2">
            <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 p-6 shadow-inner">
              <p className="text-sm font-semibold text-orange-700">Nasıl çalışır?</p>
              <ol className="mt-3 space-y-3 text-sm text-zinc-700">
                <li>1. Ana sayfada testini oluşturmayı veya arkadaşının testini çözmeyi seç.</li>
                <li>2. Test oluştururken 20 soruluk havuzdan 10 soru belirle, kendi sorunları ekleyebilirsin.</li>
                <li>3. Cevaplarını kaydet, link üret ve arkadaşlarına gönder.</li>
                <li>4. Arkadaşların linke tıklayıp soruları geriye dönemeden yanıtlar.</li>
                <li>5. Test bitince herkesin skorları skor tablosunda listelenir.</li>
              </ol>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-sm font-semibold text-zinc-800">Arkadaşının testini çöz</p>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <input
                    value={solveLink}
                    onChange={(e) => setSolveLink(e.target.value)}
                    placeholder="Linki buraya yapıştır"
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm focus:border-orange-400 focus:outline-none"
                  />
                  <button
                    onClick={() => setView("solve")}
                    className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5"
                  >
                    Teste git
                  </button>
                </div>
                <p className="mt-2 text-xs text-zinc-600">Arkadaşının gönderdiği linki buraya yapıştırman yeterli.</p>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-zinc-800">Kendi testini oluştur</p>
                <p className="mt-1 text-sm text-zinc-600">10 soruluk test için 20 soruluk havuz seni bekliyor. Hatta kendi sorunu da ekleyebilirsin.</p>
                <button
                  onClick={() => setView("create")}
                  className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5"
                >
                  Test hazırlamaya başla
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {showShareModal && generatedLink && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-zinc-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl shadow-orange-200">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-orange-700">Bu linki arkadaşlarınla paylaş</p>
                <p className="text-lg font-bold text-zinc-900">Testin hazır! Göndermeden önce kopyala.</p>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 hover:bg-orange-100"
              >
                Kapat
              </button>
            </div>
            <div className="mt-4 rounded-xl border border-orange-100 bg-orange-50 p-3 text-sm text-zinc-800">
              <p className="break-all font-medium">{generatedLink}</p>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <button
                onClick={handleCopy}
                className="rounded-xl bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-orange-200 transition hover:-translate-y-0.5"
              >
                {copied ? "Kopyalandı" : "Linki kopyala"}
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-orange-700 shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-0.5"
              >
                Tamam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
