import Link from "next/link";
import type { Metadata } from "next";
import { Building2 } from "lucide-react";
import { AnimatedBanner } from "@/components/AnimatedBanner";
import { LivePGFeed } from "@/components/LivePGFeed";

export const metadata: Metadata = {
  title: "PG Near Me - Find Paying Guest & Hostel Accommodation in India",
  description:
    "Search boys PG, girls PG, paying guest and hostel accommodation across Bangalore, Mumbai, Delhi, NCR, Hyderabad, Pune, Chennai, Kolkata, Ahmedabad and Jaipur. Compare price, food, WiFi, AC and amenities. List your PG free, no brokerage, direct owner contact.",
};

const indiaCities = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Gurgaon",
  "Noida",
  "Hyderabad",
  "Pune",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Kochi",
];

export default function HomePage() {
  return (
    <div>
      <AnimatedBanner />

      <LivePGFeed />

      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-surface-alt" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            Own a PG or Hostel?
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            List your property on PGNearMe and reach thousands of potential tenants.
            Free listing, zero commission, direct inquiries.
          </p>
          <Link
            href="/owner"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--btn)] text-[var(--btn-text)] font-semibold hover:bg-[var(--btn-hover)] transition-all neon-glow"
          >
            <Building2 className="w-5 h-5" />
            List Your PG Now
          </Link>
        </div>
      </section>

      <section className="py-14 relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            Paying Guest &amp; Hostel Accommodation Across India
          </h2>
          <p className="text-muted text-center max-w-3xl mx-auto mb-8">
            PG Near Me connects students and working professionals with trusted boys
            PG, girls PG, co-living spaces, hostels, rented rooms and fully furnished
            monthly accommodations in cities across India. Compare single sharing,
            double sharing and triple sharing rooms with food, WiFi, AC, laundry and
            power backup — all at transparent prices with zero brokerage.
          </p>
          <div className="flex flex-wrap justify-center gap-2.5 mb-10">
            {indiaCities.map((city) => (
              <Link
                key={city}
                href={`/search?city=${encodeURIComponent(city)}`}
                className="px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium text-foreground hover:border-primary/50 hover:text-foreground transition-colors"
              >
                PG in {city}
              </Link>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "For Students",
                text: "Budget hostels, university area PGs and student accommodations with mess food, study-friendly environments and affordable monthly rents near colleges and coaching centres.",
              },
              {
                title: "For Professionals",
                text: "Co-living rooms near IT parks, offices and metro stations. Single and double sharing PGs with WiFi, housekeeping, AC and flexible month-to-month stays for working men and women.",
              },
              {
                title: "For Home Owners",
                text: "List your PG, hostel, rental room or co-living property free on PG Near Me and get verified inquiries from genuine tenants directly — no brokers, no commission.",
              },
            ].map(({ title, text }) => (
              <div key={title} className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}