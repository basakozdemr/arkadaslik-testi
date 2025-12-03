// components/layout/MainHeader.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

const MAIN_SITE_URL = "https://flovi.com.tr"; // BURAYI kendi ana projenin URL'i ile değiştir

export function MainHeader() {
    const router = useRouter();

    const handleLogoClick = useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            // Eğer ana site tamamen ayrı bir proje ise:
            window.location.href = MAIN_SITE_URL;
            // Eğer Next içinde başka bir route'a gitmek istersen:
            // router.push("/"); // gibi
        },
        []
    );

    return (
        <header className="w-full border-b border-rose-100/70 bg-white/80 backdrop-blur-sm">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                {/* Sol taraf: logo + Flovi */}
                <button
                    onClick={handleLogoClick}
                    className="flex items-center gap-2 rounded-full px-2 py-1 transition hover:bg-rose-50"
                >
                    {/* Logo alanı */}
                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100">
                        {/* Gerçek logo geldiğinde bunu Image ile değiştirirsin */}
                        {/* <Image src="/flovi-logo.png" alt="Flovi" width={32} height={32} className="rounded-2xl" /> */}
                        <span className="text-sm font-bold text-rose-600">F</span>
                    </div>
                    <span className="text-lg font-bold tracking-tight text-rose-900">
                        flovi
                    </span>
                </button>

                {/* Sağ taraf - şimdilik boş, istersen sonra menü vs ekleriz */}
                <div className="flex items-center gap-2 text-xs text-rose-500">
                    {/* örnek: */}
                    {/* <Link href="/about" className="hover:text-rose-700">Hakkında</Link> */}
                </div>
            </div>
        </header>
    );
}
