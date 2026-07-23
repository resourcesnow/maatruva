import type { Metadata, Viewport } from "next";
import { MotionConfig } from "framer-motion";
import { Playfair_Display, Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/providers/session-provider";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";
import { PreloaderGate } from "@/components/providers/preloader-gate";
import { auth } from "@/lib/auth";
import { brand } from "@/lib/brand";
import "./globals.css";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const displayFont = Playfair_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} | ${brand.tagline}`,
    template: `%s | ${brand.name}`,
  },
  description: brand.tagline,
  metadataBase: new URL(brand.siteUrl),
};

// Without this, mobile browsers render the page at a wide desktop-like layout viewport (often
// ~980px) and zoom out to fit the screen — every Tailwind sm:/md: breakpoint would then evaluate
// against that virtual width instead of the device's real width, making mobile always render the
// desktop/tablet styles, badly zoomed out.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${bodyFont.variable} ${displayFont.variable} h-full antialiased`}
    >
      {/* overflow-x-hidden here is a deliberate safety net, not a substitute for fixing
          layout bugs: it guarantees no page-level sideways scroll can ever appear (e.g. from
          a decorative absolutely-positioned element on a marketing section) without
          interfering with position:sticky, which breaks if this is applied on <html> instead. */}
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <AuthProvider session={session}>
          {/* reducedMotion="user" makes every Framer Motion animation in the app (not just
              ones we explicitly gate) automatically honor the OS prefers-reduced-motion
              setting — transform-driven motion (x/y/scale/rotate) is disabled, opacity
              crossfades remain. */}
          <MotionConfig reducedMotion="user">
            <TooltipProvider delay={200}>
              <SmoothScrollProvider />
              <PreloaderGate>{children}</PreloaderGate>
              <Toaster position="bottom-right" richColors closeButton />
            </TooltipProvider>
          </MotionConfig>
        </AuthProvider>
      </body>
    </html>
  );
}
