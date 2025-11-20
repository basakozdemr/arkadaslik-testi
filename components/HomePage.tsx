"use client";

import { useCallback, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const extractTestId = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  const match = trimmed.match(/test\/([^/?]+)/);
  if (match) {
    return match[1];
  }

  return trimmed;
};

export default function HomePage() {
  const [testLink, setTestLink] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const router = useRouter();
  const audioContextRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback(() => {
    if (isMuted || typeof window === "undefined") {
      return;
    }

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new window.AudioContext();
      }

      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => undefined);
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.08;
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const now = ctx.currentTime;
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch {
      // Ignore audio errors so UI keeps working.
    }
  }, [isMuted]);

  const handleSolve = () => {
    const testId = extractTestId(testLink);
    if (!testId) {
      return;
    }

    playBeep();
    router.push(`/test/${testId}`);
  };

  const handleCreateClick = () => {
    playBeep();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSolve();
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-rose-50 via-rose-100 to-rose-200 text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-8 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 rounded-3xl bg-white/80 p-5 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 to-rose-500 text-white shadow-inner">
              <span className="text-2xl font-black tracking-tight">fl</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-rose-300">flovi</p>
              <h1 className="text-2xl font-semibold text-slate-900">Arkadaşlık Testi</h1>
              <p className="text-sm text-slate-500">Flovi’nin sosyal oyun alanındaki arkadaşlık testi uygulaması 💞</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMuted((prev) => !prev)}
            className="self-start rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-500 transition hover:bg-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
          >
            {isMuted ? "🔊 Sesi Aç" : "🔇 Sessize Al"}
          </button>
        </header>

        <div className="grid flex-1 gap-6 md:grid-cols-[3fr_2fr]">
          <div className="rounded-3xl bg-white/90 p-8 shadow-xl">
            <p className="text-sm font-medium uppercase tracking-wider text-rose-400">🎯 Hemen Başla</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Arkadaşlık Testi</h2>
            <p className="mt-2 text-sm text-slate-500">
              Sevdiklerinle eğlenceli sorular paylaşıp kim seni daha iyi tanıyor keşfet!
            </p>
            <Link
              href="/create"
              onClick={handleCreateClick}
              className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-rose-400 px-6 py-3 text-lg font-semibold text-white transition hover:bg-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200"
            >
              ✨ Kendi testini oluştur
            </Link>
            <div className="mt-6 space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wide text-rose-400">
                📎 Arkadaşının linki
              </label>
              <input
                type="text"
                value={testLink}
                placeholder="Arkadaşının test linkini yapıştır"
                onChange={(event) => setTestLink(event.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full rounded-2xl border border-rose-100 bg-white px-5 py-3 text-base text-slate-900 placeholder-rose-300 shadow-inner focus:border-rose-300 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSolve}
                disabled={!testLink.trim()}
                className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-lg font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                🚀 Testi çöz
              </button>
            </div>
          </div>

          <section className="rounded-3xl bg-white/70 p-6 shadow-lg">
            <p className="text-sm font-semibold uppercase tracking-wider text-rose-400">🔍 Nasıl çalışır?</p>
            <ol className="mt-4 space-y-4 text-sm text-slate-600">
              <li>1️⃣ Ana sayfada testini oluşturmayı veya arkadaşının testini çözmeyi seç.</li>
              <li>2️⃣ Test oluştururken 20 soruluk havuzdan 10 soru belirle, kendi sorunları ekleyebilirsin.</li>
              <li>3️⃣ Cevaplarını kaydet, link üret ve arkadaşlarına gönder.</li>
              <li>4️⃣ Arkadaşların linke tıklayıp soruları geriye dönemeden yanıtlar.</li>
              <li>5️⃣ Test bitince herkesin skorları skor tablosunda listelenir.</li>
            </ol>
          </section>
        </div>
      </div>
    </main>
  );
}
