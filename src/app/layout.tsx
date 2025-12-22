// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { MainHeader } from "../../components/layout/MainHeader";
import { Sour_Gummy } from "next/font/google";
import Script from "next/script";

const sourGummy = Sour_Gummy({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
  variable: "--font-main", // CSS değişkeni
});

export const metadata: Metadata = {
  title: "Flovi - Arkadaşlık Testi💘",
  description: "Flovi Arkadaşlık Testi ile arkadaşlarının seni ne kadar tanıdığını keşfet! Kişisel sorularla kendi testini oluştur, linki paylaş ve kim seni daha iyi tanıyor gör. Ücretsiz ve eğlenceli.🚀",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={sourGummy.variable}>
      <head>
        {/* Google Analytics - Arkadaşlık Testi */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-BYZXCD5V12"
        />
        <Script id="ga-arkadaslik" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BYZXCD5V12', {
              page_path: window.location.pathname,
            });
          `}
        </Script>
      </head>

      <body>
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
