"use client";

import { useEffect, useState } from "react";
import { loadStoredTests, StoredTest } from "../lib/friendTestStorage";
import Link from "next/link";

export default function HomePage() {
  const [tests, setTests] = useState<StoredTest[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadStoredTests();
    const sorted = [...stored].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    setTests(sorted);
    setLoaded(true);
  }, []);

  return (
    <div className="min-h-screen app-bg app-text-main">
      <main className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        {/* Üst: açıklama / kurallar */}
        <section className="rounded-3xl border app-card bg-white/80 p-8 shadow-sm backdrop-blur space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] app-text-muted">
              Arkadaşlık testi
            </p>
            <h1 className="text-3xl font-bold app-text-main">
              Arkadaşların seni ne kadar tanıyor? 💫
            </h1>
            <p className="text-sm app-text-muted">
              Flovi arkadaşlık testi, seni ne kadar tanıdıklarını görmek için hazırlanmış küçük ve
              eğlenceli bir oyun. Kendin hakkında kısa bir test hazırlanır, linki arkadaşlarınla
              paylaşırsın ve cevaplar sonuç ekranında karşılaştırılır.
            </p>
          </div>
          <div className="space-y-1 text-sm app-text-muted">
            <p>• Sorular; günlük alışkanlıkların, tercihlerin ve seni anlatan küçük detaylarla ilgilidir. 🌷</p>
            <p>• Test çözüldüğünde, sonuçlarda kim seni ne kadar tanımış rahatça görebilirsin. 🤝</p>
          </div>
          <div className="pt-2">
            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full app-btn-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
            >
              <span>Yeni test hazırla</span>
              <span>🚀</span>
            </Link>
          </div>
        </section>

        {/* Alt: KULLANICININ DAHA ÖNCE HAZIRLADIĞI TESTLER */}
        <section className="rounded-3xl border border-rose-100 bg-white/90 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-rose-900">
                Hazırladığın testler 💌
              </h2>
              <p className="text-xs text-rose-600">
                Daha önce oluşturduğun testler burada listelenir; istediğin zaman tekrar açıp
                sonuçlara bakabilirsin.
              </p>
            </div>
            {!loaded && (
              <span className="text-xs text-rose-500">
                Yükleniyor...
              </span>
            )}
          </div>

          {loaded && tests.length === 0 && (
            <p className="mt-3 text-sm text-rose-700">
              Henüz bir test hazırlanmamış görünüyor. 🌱
              <br />
              İlk testini oluşturduğunda, burada saklanmaya başlayacak.
            </p>
          )}

          {loaded && tests.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-rose-900">
              {tests.map((test, index) => {
                const createdAt = new Date(test.createdAt).toLocaleString("tr-TR");
                const resultUrl = `/results/${test.id}`; // sonuç sayfan
                const testUrl = `/test/${test.id}`;       // test çözüm sayfan

                return (
                  <li
                    key={test.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-100 bg-rose-50/60 px-3 py-2"
                  >
                    <div className="space-y-0.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-500">
                        Test #{index + 1}
                      </p>
                      {test.creatorName && (
                        <p className="text-xs text-rose-700">
                          Hazırlayan: <span className="font-medium">{test.creatorName}</span>
                        </p>
                      )}
                      <p className="text-xs text-rose-700">
                        Oluşturma tarihi: {createdAt}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={testUrl}
                        className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-rose-700 shadow-sm border border-rose-200 hover:bg-rose-50"
                      >
                        <span>Testi aç</span>
                        <span>✨</span>
                      </Link>
                      <Link
                        href={resultUrl}
                        className="inline-flex items-center gap-1 rounded-full bg-rose-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-600"
                      >
                        <span>Sonuçları gör</span>
                        <span>📊</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
