import Link from "next/link";
import Image from "next/image";
import { MapPin, Star, Wifi, UtensilsCrossed, ShieldCheck, IndianRupee, Navigation, Film } from "lucide-react";
import { formatDistance } from "@/lib/geo";
import { LikeButton } from "@/components/LikeButton";
import type { PGListing } from "@/lib/listings";

const genderBadgeColors: Record<string, string> = {
  male: "bg-secondary/15 text-secondary border border-secondary/30",
  female: "bg-accent/15 text-accent border border-accent/30",
  unisex: "bg-primary/10 text-primary border border-primary/20",
};

function getAmenityIcon(amenity: string) {
  const lower = amenity.toLowerCase();
  if (lower.includes("wifi")) return <Wifi className="w-3.5 h-3.5 text-secondary-light" />;
  if (lower.includes("food") || lower.includes("mess") || lower.includes("meal"))
    return <UtensilsCrossed className="w-3.5 h-3.5 text-secondary" />;
  return null;
}

export function PGCard({ listing }: { listing: PGListing }) {
  const stars = Array.from({ length: 5 });
  const ratingPct = Math.max(0, Math.min(100, (listing.rating / 5) * 100));
  return (
    <Link href={`/pg/${listing.id}`} className="block">
      <div className="bg-surface rounded-xl border border-border overflow-hidden card-hover group [content-visibility:auto] [contain-intrinsic-size:auto_420px]">
        <div className="relative h-48 bg-surface overflow-hidden">
          {listing.images[0] ? (
            <Image
              src={listing.images[0]}
              alt={listing.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-5xl font-bold text-primary/20 animate-float">
                {listing.name.charAt(0)}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <span
            className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full ${genderBadgeColors[listing.gender]}`}
          >
            {listing.gender === "male" ? "Boys" : listing.gender === "female" ? "Girls" : "Co-ed"}
          </span>
          {listing.distance !== null && listing.distance !== undefined && (
            <span className="absolute top-14 right-3 bg-black/80 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
              <Navigation className="w-3 h-3 text-white" />
              {formatDistance(listing.distance)}
            </span>
          )}
          <div className="absolute top-3 right-3">
            <LikeButton entityId={listing.id} seedCount={listing.likes ?? 0} size="sm" />
          </div>
          <span className="absolute bottom-3 left-3 text-xs font-medium text-white/90 bg-primary/80 backdrop-blur-sm px-2 py-0.5 rounded">
            {listing.images.length} photos
          </span>
          {listing.videos && listing.videos.length > 0 && (
            <span className="absolute bottom-3 right-3 text-xs font-medium text-white/90 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded flex items-center gap-1">
              <Film className="w-3 h-3" />
              {listing.videos.length} video{listing.videos.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-1 group-hover:text-primary-light transition-colors">
                {listing.name}
              </h3>
              {listing.isVerified && (
                <ShieldCheck className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
              )}
            </div>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted">
              <MapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">
                {listing.locality}, {listing.city}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-sm">
          {listing.rating > 0 && listing.reviewCount > 0 ? (
            <>
              <div className="relative inline-flex">
                <div className="flex gap-0.5">
                  {stars.map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-muted/40" />
                  ))}
                </div>
                <div
                  className="absolute left-0 top-0 overflow-hidden flex gap-0.5 pointer-events-none"
                  style={{ width: `${ratingPct}%` }}
                >
                  {stars.map((_, i) => (
                    <Star key={`fill-${i}`} className="w-4 h-4 text-accent fill-accent shrink-0" />
                  ))}
                </div>
              </div>
              <span className="font-medium">{listing.rating.toFixed(1)}</span>
              <span className="text-xs text-muted">({listing.reviewCount})</span>
            </>
          ) : (
            <span className="text-xs text-muted">No reviews yet</span>
          )}
          <span className="text-xs text-muted ml-auto">{listing.occupancy}</span>
        </div>

          {listing.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {listing.amenities.slice(0, 4).map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-xs bg-surface-alt px-2 py-1 rounded-md text-muted border border-border"
                >
                  {getAmenityIcon(amenity)}
                  {amenity}
                </span>
              ))}
              {listing.amenities.length > 4 && (
                <span className="text-xs text-primary-light px-2 py-1 font-medium">
                  +{listing.amenities.length - 4} more
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-secondary" />
              <span className="font-bold text-lg text-foreground">
                {listing.priceMin.toLocaleString("en-IN")}
              </span>
              <span className="text-sm text-muted">
                - {listing.priceMax.toLocaleString("en-IN")}/mo
              </span>
            </div>
            <span className="text-sm font-medium text-primary-light group-hover:text-primary-light transition-colors">
              View Details
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
