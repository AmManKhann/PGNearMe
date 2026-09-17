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
  metadataBase: new URL("https://pgnearme-tau.vercel.app"),
  title: {
    default:
      "PG Near Me - Find Paying Guest & Hostel Accommodation in India",
    template: "%s | PG Near Me",
  },
  description:
    "Find the best PG, paying guest, hostel, rental rooms and shared accommodation in India. Search thousands of boys PG, girls PG, co-living and budget hostels across Bangalore, Mumbai, Delhi, NCR, Hyderabad, Pune, Chennai, Kolkata and more. Compare price, food, WiFi, AC rooms and amenities. Free listing for owners, direct owner contact, no brokerage.",
  keywords: [
    "PG in India",
    "Paying Guest in India",
    "PG near me",
    "boys PG",
    "girls PG",
    "hostel in India",
    "co living space India",
    "budget hostel",
    "PG in Bangalore",
    "PG in Mumbai",
    "PG in Delhi",
    "PG in NCR",
    "PG in Gurgaon",
    "PG in Noida",
    "PG in Hyderabad",
    "PG in Pune",
    "PG in Chennai",
    "PG in Kolkata",
    "PG in Ahmedabad",
    "PG in Jaipur",
    "PG for students",
    "PG for working professionals",
    "PG under 5000",
    "monthly room rent India",
    "flats and rooms for rent India",
    "single sharing room PG",
    "double sharing room PG",
    "triple sharing room PG",
    "PG with food",
    "PG with WiFi",
    "PG with AC",
    "fully furnished PG",
    "list your PG online",
    "accommodation for students",
    "roommate finder India",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "PG Near Me",
    title:
      "PG Near Me - Find Paying Guest & Hostel Accommodation in India",
    description:
      "Search boys PG, girls PG, hostels and paying guest accommodation across India. Compare prices, food, amenities and book directly with owners. No brokerage.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PG Near Me - Paying Guest & Hostel Accommodation in India",
    description:
      "Find boys PG, girls PG, hostels and PG accommodation near you in India. No brokerage, direct owner contact.",
  },
  icons: {
    icon: "/pgnearme-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://pgnearme-tau.vercel.app/#organization",
                  name: "PG Near Me",
                  url: "https://pgnearme-tau.vercel.app",
                  logo: "https://pgnearme-tau.vercel.app/pgnearme-logo.png",
                  contactPoint: {
                    "@type": "ContactPoint",
                    telephone: "+91-9351524550",
                    contactType: "customer support",
                    email: "supportpgnearme@gmail.com",
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": "https://pgnearme-tau.vercel.app/#website",
                  url: "https://pgnearme-tau.vercel.app",
                  name: "PG Near Me",
                  publisher: { "@id": "https://pgnearme-tau.vercel.app/#organization" },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate:
                        "https://pgnearme-tau.vercel.app/search?city={search_term_string}",
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
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