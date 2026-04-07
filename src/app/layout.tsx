import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const SITE_URL = "https://trust-vault-steel.vercel.app";
const SITE_DESCRIPTION =
  "Confidential trust scoring for Web3 wallets. EigenTrust + AgentRank over the Intuition Protocol graph, encrypted on-chain via Inco Lightning FHE.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TrustVault \u2014 Confidential Trust Infrastructure",
    template: "%s | TrustVault",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "TrustVault \u2014 Confidential Trust Infrastructure",
    description: SITE_DESCRIPTION,
    siteName: "TrustVault",
  },
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
