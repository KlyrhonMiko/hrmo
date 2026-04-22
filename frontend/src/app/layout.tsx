import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { GlobalApiInterceptor } from "@/components/auth/GlobalApiInterceptor";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HRMO System — Personnel Digitization & Training",
  description: "PLP HRMO Personnel Digitization and Lifelong Training System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <GlobalApiInterceptor />
        {children}
      </body>
    </html>
  );
}
