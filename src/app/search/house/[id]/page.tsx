import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { MapEmbed } from "@/components/MapEmbed";
import { LikeButton } from "@/components/LikeButton";
import { ReviewSection } from "@/components/ReviewSection";
import { getHouseById, houseReviews } from "@/lib/houses";
import {
  Home,
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  IndianRupee,
  Phone,
  MessageCircle,
  ChevronLeft,
  Star,
  ShieldCheck,
  Navigation,
} from "lucide-react";

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = getHouseById(id);
  if (!house) notFound();

  const reviews = houseReviews[house.id] ?? [];
  const isAvailable = house.isAvailable;

  return (
    <div className="bg-surface-alt min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/search/house"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Houses
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="relative h-64 md:h-80 bg-surface-alt overflow-hidden">
                <Image
                  src={house.images[0]}
                  alt={house.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  unoptimized
                />
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    isAvailable ? "bg-available text-white" : "bg-red-500/90 text-white"
                  }`}
                >
                  {isAvailable ? "Available" : "Rented"}
                </span>
              </div>
              {house.images.length > 1 && (
                <div className="grid grid-cols-4 gap-1 p-1">
                  {house.images.slice(0, 4).map((src, i) => (
                    <div key={i} className="relative h-20 bg-surface-alt rounded-lg overflow-hidden">
                      <Image
                        src={src}
                        alt={`${house.name} photo ${i + 1}`}
                        fill
                        className="object-cover"
                        sizes="25vw"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-surface rounded-xl border border-border p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Home className="w-6 h-6 text-primary" />
                    <h1 className="text-2xl font-bold text-foreground">{house.name}</h1>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {house.locality}, {house.city}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex items-center gap-1 bg-accent/10 px-3 py-1.5 rounded-lg">
                    <Star className="w-5 h-5 text-accent fill-accent" />
                    <span className="font-bold text-foreground">{house.rating}</span>
                    <span className="text-sm text-muted">({house.reviewCount})</span>
                  </div>
                  <LikeButton entityId={house.id} seedCount={house.likes} variant="inline" size="sm" />
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/30 text-sm font-medium flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  {isAvailable ? "Available Now" : "Currently Rented"}
                </span>
                {house.furnished && (
                  <span className="px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/30 text-sm font-medium">
                    Furnished
                  </span>
                )}
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary-light text-sm font-medium">
                  {house.bedrooms} BHK
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt border border-border">
                  <BedDouble className="w-5 h-5 text-primary-light" />
                  <div>
                    <p className="text-xs text-muted">Bedrooms</p>
                    <p className="text-sm font-medium text-foreground">{house.bedrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt border border-border">
                  <Bath className="w-5 h-5 text-primary-light" />
                  <div>
                    <p className="text-xs text-muted">Bathrooms</p>
                    <p className="text-sm font-medium text-foreground">{house.bathrooms}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt border border-border">
                  <Maximize className="w-5 h-5 text-primary-light" />
                  <div>
                    <p className="text-xs text-muted">Area</p>
                    <p className="text-sm font-medium text-foreground">{house.areaSqft} sqft</p>
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold text-foreground mb-4">About this Property</h2>
              <p className="text-muted leading-relaxed mb-6">{house.description}</p>

              <h2 className="text-lg font-semibold text-foreground mb-4">Location</h2>
              <MapEmbed
                lat={house.lat}
                lng={house.lng}
                label={`${house.locality}, ${house.city}`}
              />
            </div>

            <ReviewSection entityId={house.id} seedReviews={reviews} title="House Reviews" />
          </div>

          <div className="space-y-6">
            <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-muted mb-1">Rent per month</p>
                <div className="flex items-center justify-center gap-1">
                  <IndianRupee className="w-6 h-6 text-secondary" />
                  <span className="text-3xl font-bold text-foreground">
                    {house.price.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt">
                  <Star className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Rating</p>
                    <p className="text-xs text-muted">
                      {house.rating} ({house.reviewCount} reviews)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-alt">
                  <Navigation className="w-5 h-5 text-muted" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Location</p>
                    <p className="text-xs text-muted">{house.locality}, {house.city}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${house.locality}, ${house.city}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all"
                >
                  <Navigation className="w-5 h-5" />
                  View on Map
                </a>
                <a
                  href={`tel:${house.landlord.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-all neon-glow-pink"
                >
                  <Phone className="w-5 h-5" />
                  Call Landlord
                </a>
                <a
                  href={`https://wa.me/${house.landlord.phone.replace(/\s/g, "").replace("+", "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-secondary text-white font-semibold hover:bg-success transition-all neon-glow-green"
                >
                  <MessageCircle className="w-5 h-5" />
                  WhatsApp
                </a>
              </div>

              <div className="mt-6 p-4 rounded-lg bg-surface-alt border border-border">
                <p className="text-sm font-medium text-foreground mb-1">Landlord</p>
                <p className="text-sm text-muted">{house.landlord.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}