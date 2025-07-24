import type React from 'react';
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProviders } from "@/components/providers/theme-providers";
import { SessionProvider } from '@/components/providers/session-provider';
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Discord Clone",
  description: "A Discord clone built with Next.js 15 and Supabase",
}
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-gradient-primary`}
      >
        <ThemeProviders attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <SessionProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </SessionProvider>
        </ThemeProviders>
      </body>
    </html>
  )
}
