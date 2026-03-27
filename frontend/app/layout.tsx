import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AsciiMorph",
  description: "Converta imagens e GIFs em arte ASCII"
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
