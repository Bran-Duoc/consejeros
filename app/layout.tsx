import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Script from "next/script";
import DynamicBackground from "@/components/DynamicBackground";
import FormbricksProvider from "@/components/FormbricksProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://consejeros.vercel.app"),
  title: "Sede Viña del Mar",
  description:
    "Plataforma integral de gestión de solicitudes y experiencia estudiantil. Tu voz construye nuestra sede.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Portal Consejo",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#5483BF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="h-screen w-full overflow-hidden grid grid-rows-[auto_1fr_auto] bg-background text-foreground m-0 p-0 box-border">
        <DynamicBackground />
        <AppProvider>
          <FormbricksProvider />
          <Navbar />
          <main className="w-full overflow-y-auto overflow-x-hidden relative custom-scrollbar">
            {children}
          </main>
          <Footer />
        </AppProvider>
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}

function ServiceWorkerRegistrar() {
  return (
    <Script
      id="service-worker-registrar"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js').catch(() => {});
            });
          }
        `,
      }}
    />
  );
}
