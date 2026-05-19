import type { Metadata } from "next";
import { Sora } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import LenisProvider from "@/components/LenisProvider";
import Menu from "@/components/Menu";
import Ambience from "@/components/fx/Ambience";
import RouteTransition from "@/components/fx/RouteTransition";

// Spec/hafıza: tüm site Sora. Variable font, --font-sora değişkenine bağlanır.
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Talha — Software · 3D · AI",
  description:
    "I build the whole thing. Software, 3D, AI — backend to frontend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sora.variable}>
      <body>
        <LenisProvider>
          <Menu />
          {children}
          <Ambience />
          <RouteTransition />
        </LenisProvider>
      </body>
    </html>
  );
}
