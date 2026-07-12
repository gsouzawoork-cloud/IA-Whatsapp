import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

/**
 * Manrope (variável) auto-hospedada pelo next/font — sem arquivos de fonte no
 * repositório e sem requisição em runtime. Exposta como `--font-manrope`,
 * consumida pelo token `--font-sans` em globals.css.
 */
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — Central inteligente de atendimento`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`h-full antialiased ${manrope.variable}`}>
      <body className="flex min-h-full flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-50">
        {children}
      </body>
    </html>
  );
}
