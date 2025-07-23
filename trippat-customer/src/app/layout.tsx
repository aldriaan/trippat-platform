import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trippat - AI-Powered Multilingual Travel Platform",
  description: "Experience the world with our AI-powered multilingual travel platform supporting Arabic and English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
