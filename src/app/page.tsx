import Link from "next/link";
import { Building2 } from "lucide-react";
import { AnimatedBanner } from "@/components/AnimatedBanner";
import { LivePGFeed } from "@/components/LivePGFeed";

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
    </div>
  );
}