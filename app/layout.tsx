import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/components/layout";
import { ServiceWorkerRegistration } from "@/components/pwa";

export const metadata: Metadata = {
  title: "SchedLume - Class Schedule",
  description: "Mobile-first offline class schedule viewer with notes",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SchedLume",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#F97B5C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="antialiased w-full">
        {/* Main content area with bottom padding for nav + safe area */}
        <div className="min-h-screen w-full pb-24 pb-safe">{children}</div>
        <BottomNav />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
