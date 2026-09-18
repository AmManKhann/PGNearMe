import { MapPin, Navigation } from "lucide-react";

export function MapEmbed({
  lat,
  lng,
  label,
  mapsUrl,
  className = "",
}: {
  lat: number;
  lng: number;
  label?: string;
  mapsUrl?: string;
  className?: string;
}) {
  const half = 0.008;
  const bbox = `${lng - half},${lat - half},${lng + half},${lat + half}`;
  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  const directionsUrl = mapsUrl
    ? mapsUrl.startsWith("http")
      ? mapsUrl
      : `https://${mapsUrl}`
    : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div className={`bg-surface rounded-xl border border-border overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-accent" />
          <div>
            <p className="text-sm font-semibold text-foreground">Location</p>
            {label && <p className="text-xs text-muted">{label}</p>}
          </div>
        </div>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all neon-glow"
        >
          <Navigation className="w-4 h-4" />
          Get Directions
        </a>
      </div>
      <iframe
        src={osmSrc}
        title={`Map location for ${label ?? "property"}`}
        className="w-full h-64 md:h-72 border-0 map-frame-dark"
        loading="lazy"
      />
    </div>
  );
}