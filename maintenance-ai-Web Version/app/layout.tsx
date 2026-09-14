import type { Metadata } from "next";
import { Cairo, IBM_Plex_Sans_Arabic } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const cairo = Cairo({
  subsets: ["arabic"],
  weight: ["600", "700", "800"],
  variable: "--font-cairo",
});

const plex = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600"],
  variable: "--font-plex",
});

export const metadata: Metadata = {
  title: "بلاغات الصيانة",
  description: "استلام وتصنيف طلبات الصيانة المنزلية بمساعدة الذكاء الاصطناعي",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${plex.variable}`}>
      <body className="font-body min-h-screen bg-paper text-ink">
        <header className="sticky top-0 z-10 border-b border-line bg-blueprint text-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
            <Link href="/" className="font-display text-lg font-bold tracking-tight sm:text-xl">
              بلاغات الصيانة
            </Link>
            <nav className="flex items-center gap-1 text-sm sm:text-base">
              <Link
                href="/"
                className="rounded-sm px-3 py-1.5 transition-colors hover:bg-blueprint-light"
              >
                بلاغ جديد
              </Link>
              <Link
                href="/requests"
                className="rounded-sm px-3 py-1.5 transition-colors hover:bg-blueprint-light"
              >
                كل البلاغات
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">{children}</main>
      </body>
    </html>
  );
}
