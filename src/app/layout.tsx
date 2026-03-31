import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TrustVault",
  description:
    "Confidential Trust Infrastructure powered by Inco Lightning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={cn(
          inter.variable,
          "min-h-screen bg-[#0a0a0a] font-sans antialiased"
        )}
      >
        <Providers>
          <TooltipProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
