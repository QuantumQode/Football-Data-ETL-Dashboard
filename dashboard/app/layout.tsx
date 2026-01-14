import type { Metadata } from "next";
import { Rajdhani } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import HeaderWrapper from "./components/HeaderWrapper";

const rajdhani = Rajdhani({
  variable: "--font-rajdhani",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MatchMetric | Football Statistics Dashboard",
  description: "Real-time football statistics, player analytics, and match insights",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${rajdhani.variable} antialiased`}>
        <Suspense fallback={<div className="h-16" />}>
          <HeaderWrapper />
        </Suspense>
        <div className="pt-16">
          {children}
        </div>
      </body>
    </html>
  );
}
