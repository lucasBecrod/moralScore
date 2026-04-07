import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { SITE_CONFIG, NAV_LINKS } from "@/shared/config/site";
import { AuthProvider } from "@/shared/providers/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MoralScore — Razonamiento moral verificable",
  description: SITE_CONFIG.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`dark ${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="border-b border-gray-800">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold tracking-tight">
              <img src="/favicon.ico" alt="" className="h-6 w-6" />
              {SITE_CONFIG.name}
            </Link>
            <nav className="flex gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-400 transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>

        <main className="flex-1">
          <AuthProvider>{children}</AuthProvider>
        </main>

        <footer className="border-t border-gray-800">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm text-gray-500">
            <span>
              {SITE_CONFIG.name} — {SITE_CONFIG.context}
            </span>
            <a
              href={SITE_CONFIG.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-white"
            >
              GitHub
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
