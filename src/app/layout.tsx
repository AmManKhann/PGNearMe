import type { Metadata } from "next";
import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SessionProvider } from "@/components/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PG Near Me - Find Paying Guest & Hostel Accommodation",
  description:
    "Find the best PG, hostel, and paying guest accommodations near you. Search by city, locality, price, and amenities. Direct owner contact.",
  icons: {
    icon: "/pgnearme-logo.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `try{(function(){var t=localStorage.getItem("pgnearme_theme");if(t==="light"){document.documentElement.classList.add("light")}})()}catch(e){}`,
          }}
        />
        {/* Watermark logo — very faint overlay behind header/nav but above page backgrounds */}
        <div
          aria-hidden
          className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
        >
          <Image
            src="/pgnearme-logo.png"
            alt=""
            fill
            sizes="100vw"
            className="object-contain opacity-[0.05]"
            unoptimized
          />
        </div>

        <SessionProvider>
          <div className="relative z-10 flex min-h-screen flex-col bg-background text-foreground">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}