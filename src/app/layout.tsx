// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { MainHeader } from "../../components/layout/MainHeader";
import { Sour_Gummy } from "next/font/google";

const sourGummy = Sour_Gummy({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-main", // CSS değişkeni
});

export const metadata: Metadata = {
  title: "💘Flovi - Arkadaşlık Testi💘",
  description: "Flovi Arkadaşlık Testi ile arkadaşlarının seni ne kadar tanıdığını keşfet! Kişisel sorularla kendi testini oluştur, linki paylaş ve kim seni daha iyi tanıyor gör. Ücretsiz ve eğlenceli.🚀",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={sourGummy.variable}>
      <body>
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
