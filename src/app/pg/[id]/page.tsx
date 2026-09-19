"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { PGRecord } from "@/lib/types";
import { LikeButton } from "@/components/LikeButton";
import { ReviewSection } from "@/components/ReviewSection";
import { ImageGallery } from "@/components/ImageGallery";
import { parseMapsCoords } from "@/lib/mapscoords";
import {
  MapPin,
  Navigation,
  Star,
  ShieldCheck,
  Wifi,
  UtensilsCrossed,
  Wind,
  WashingMachine,
  Zap,
  Dumbbell,
  Camera,
  Phone,
  MessageCircle,
  Globe,
  ChevronLeft,
  IndianRupee,
  Users,
  Building2,
  Clock,
  Film,
} from "lucide-react";

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes("wifi")) return <Wifi className="w-5 h-5" />;
  if (lower.includes("food") || lower.includes("mess") || lower.includes("meal"))
    return <UtensilsCrossed className="w-5 h-5" />;
  if (lower.includes("ac")) return <Wind className="w-5 h-5" />;
  if (lower.includes("laundry")) return <WashingMachine className="w-5 h-5" />;
  if (lower.includes("power") || lower.includes("backup"))
    return <Zap className="w-5 h-5" />;
  if (lower.includes("gym")) return <Dumbbell className="w-5 h-5" />;
  if (lower.includes("cctv") || lower.includes("camera"))
    return <Camera className="w-5 h-5" />;
  return <Building2 className="w-5 h-5" />;
}

export default function PGDetailPage() {
  const params = useParams<{ id: string }>();
  return <PGContent id={params.id} />;
}

function PGContent({ id }: { id: string }) {
  const [pg, setPg] = useState<PGRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pg/${id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!cancelled) setPg(data.listing);
      } catch {
        if (!cancelled) setPg(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div className="bg-surface-alt min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (!pg) {
    return (
      <div className="bg-surface-alt min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-muted mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-foreground mb-2">PG Not Found</h1>
          <Link href="/" className="text-primary hover:underline text-sm">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const fullAddress = [pg.address, pg.locality, pg.city, pg.state, pg.pincode]
    .filter((part) => part && String(part).trim())
    .join(", ");
  const mapsLink = pg.mapsUrl?.trim()
    ? pg.mapsUrl.startsWith("http")
      ? pg.mapsUrl
      : `https://${pg.mapsUrl}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`;
  const destCoords = pg.mapsUrl ? parseMapsCoords(pg.mapsUrl) : null;
  const embedSrc = destCoords
    ? `https://maps.google.com/maps?q=${destCoords.lat}%2C${destCoords.lng}&t=k&z=18&output=embed`
    : `https://maps.google.com/maps?q=${encodeURIComponent(fullAddress)}&t=k&z=16&output=embed`;

  return (
    <div className="bg-surface-alt min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <ImageGallery images={pg.images} name={pg.name} />
              {pg.videos && pg.videos.length > 0 && (
                <div className="p-4 border-t border-border">
                  <div className="flex items-center gap-2 mb-3">
                    <Film className="w-4 h-4 text-accent" />
                    <span className="text-sm font-semibold text-foreground">
                      Videos ({pg.videos.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pg.videos.map((src, i) => (
                      <div key={i} className="relative aspect-video bg-black rounded-lg overflow-hidden">
                        <video
                          src={src}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-[11px] font-medium text-white bg-black/60 px-2 py-0.5 rounded">
                          Video {i + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl font-bold text-foreground">
                      {pg.name}
                    </h1>
                    {pg.isVerified && (
                      <ShieldCheck className="w-6 h-6 text-secondary" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {pg.locality || pg.address}
                      {pg.city && pg.locality ? `, ${pg.city}` : ""}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  {pg.rating > 0 && (
                    <div className="flex items-center gap-1.5 bg-accent/10 px-3 py-1.5 rounded-lg">
                      <div className="relative inline-flex">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={n} className="w-4 h-4 text-muted/40" />
                          ))}
                        </div>
                        <div
                          className="absolute left-0 top-0 overflow-hidden flex gap-0.5 pointer-events-none"
                          style={{ width: `${Math.max(0, Math.min(100, (pg.rating / 5) * 100))}%` }}
                        >
                          {[1, 2, 3, 4, 5].map((n) => (
                            <Star key={`fill-${n}`} className="w-4 h-4 text-accent fill-accent shrink-0" />
                          ))}
                        </div>
                      </div>
                      <span className="font-bold text-foreground">{pg.rating}</span>
                      <span className="text-sm text-muted">({pg.reviewCount})</span>
                    </div>
                  )}
                  <LikeButton entityId={id} seedCount={pg.likes} variant="inline" size="sm" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium">
                  {pg.gender === "male" ? "Boys Only" : pg.gender === "female" ? "Girls Only" : "Unisex"}
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-alt text-muted text-sm">
                  {pg.occupancy}
                </span>
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/30 text-sm font-medium">
                  {pg.totalBeds} beds total
                </span>
              </div>

              <p className="text-muted leading-relaxed mb-6">{pg.description}</p>

              <h2 className="text-lg font-semibold text-foreground mb-4">Pricing</h2>
              <div className="space-y-3 mb-6">
                {pg.pricing.map(({ type, price, meals }) => (
                  <div
                    key={type}
                    className="flex items-center justify-between p-4 rounded-lg bg-surface-alt border border-border"
                  >
                    <div>
                      <p className="font-medium text-foreground">{type}</p>
                      <p className="text-sm text-muted">{meals}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4 text-secondary" />
                      <span className="text-lg font-bold text-foreground">
                        {price.toLocaleString("en-IN")}
                      </span>
                      <span className="text-sm text-muted">/mo</span>
                    </div>
                  </div>
                ))}
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                {pg.amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt border border-border"
                  >
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {getAmenityIcon(amenity)}
                    </div>
                    <span className="text-sm font-medium text-foreground">{amenity}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 bg-surface-alt rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <h2 className="text-lg font-semibold text-foreground">Location</h2>
                </div>
                <p className="text-muted leading-relaxed mb-5">{fullAddress}</p>
                <a
                  href={mapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all neon-glow"
                >
                  <Navigation className="w-5 h-5" />
                  Get Directions
                </a>
                <div className="mt-4 rounded-xl border border-border overflow-hidden">
                  <iframe
                    src={embedSrc}
                    title={`3D location view for ${pg.name}`}
                    className="w-full h-64 md:h-72 border-0 map-frame-dark"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>

            <ReviewSection entityId={id} seedReviews={[]} />
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-muted mb-1">Starting from</p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-6 h-6 text-secondary" />
                  <span className="text-3xl font-bold text-foreground">
                    {pg.priceMin.toLocaleString("en-IN")}
                  </span>
                  <span className="text-muted">/mo</span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt">
                  <Users className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Total Beds</p>
                    <p className="text-xs text-muted">
                      {pg.totalBeds} beds &middot; {pg.occupancy}
                    </p>
                  </div>
                </div>
                {pg.rating > 0 && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt">
                    <Star className="w-5 h-5 text-muted" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Rating</p>
                      <p className="text-xs text-muted">
                        {pg.rating} ({pg.reviewCount} reviews)
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {(pg.phone || pg.whatsapp) && (
                <div className="space-y-3">
                  {pg.phone && (
                    <a
                      href={`tel:${pg.phone}`}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all neon-glow"
                    >
                      <Phone className="w-5 h-5" />
                      Call Owner
                    </a>
                  )}
                  <a
                    href={`https://wa.me/${String(pg.whatsapp || pg.phone)
                      .replace(/\s/g, "")
                      .replace("+", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-success transition-all neon-glow-green"
                  >
                    <MessageCircle className="w-5 h-5" />
                    WhatsApp
                  </a>
                  {pg.website && (
                    <a
                      href={pg.website.startsWith("http") ? pg.website : `https://${pg.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-surface-alt border border-border text-foreground font-semibold hover:border-accent/50 hover:text-accent transition-all"
                    >
                      <Globe className="w-5 h-5" />
                      Visit Website
                    </a>
                  )}
                </div>
              )}

              <div className="mt-6 p-4 rounded-lg bg-surface-alt border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Owner</p>
                <p className="text-sm text-muted">{pg.ownerName}</p>
                <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Contact via {pg.phone || pg.whatsapp ? "phone or WhatsApp" : "details page"}
                </p>
                <p className="text-xs text-muted mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Response time: usually within 1 hour
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}