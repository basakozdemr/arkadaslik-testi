// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { MainHeader } from "../../components/layout/MainHeader";

export const metadata: Metadata = {
  title: "Flovi - Arkadaşlık Testi",
  description: "Arkadaşların seni ne kadar tanıyor?",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-rose-50/40">
        <MainHeader />
        {children}
      </body>
    </html>
  );
}
