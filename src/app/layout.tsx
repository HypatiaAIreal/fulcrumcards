import type { Metadata } from "next";
import { Playfair_Display, IBM_Plex_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const plex = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-plex",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://cards.thefulcrumproject.org"),
  title: {
    default: "FulcrumCards — El Fulcro Invisible",
    template: "%s · FulcrumCards",
  },
  description:
    "Catálogo de cards diagnósticas del framework El Fulcro Invisible. Cada card diagnostica una profesión, empresa o caso a través de cuatro fulcros: material, epistémico, relacional y procedencia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${playfair.variable} ${plex.variable} ${mono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
