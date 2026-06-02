import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Axis - Simulador Interactivo de Biomecánica Aplicada",
  description: "Simulador interactivo 2D para el análisis biomecánico de Press de Banca Plano, diseñado para educadores de ciencias del deporte y profesionales de la salud. Analiza trayectorias, ángulos articulares y tensiones musculares en tiempo real.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-zinc-100 selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
