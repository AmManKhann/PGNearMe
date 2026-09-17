import { notFound } from "next/navigation";
import { SpaceDetail, type SpaceDetailSpec } from "@/components/SpaceDetail";
import { shopListings, shopReviews, getShopById } from "@/lib/spaces";
import { Store, Maximize, Ruler, Bath, Zap } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const shop = getShopById(id);
  if (!shop) return { title: "Shop Not Found | PG Near Me" };
  return { title: `${shop.name} | Shop for Rent` };
}

export default async function ShopDetailPage({ params }: Props) {
  const { id } = await params;
  const shop = getShopById(id);
  if (!shop) notFound();

  const specs: SpaceDetailSpec[] = [
    { icon: Maximize, label: "Area", value: `${shop.areaSqft} sqft` },
    { icon: Ruler, label: "Frontage", value: `${shop.frontage} ft` },
    {
      icon: Zap,
      label: "Power",
      value: shop.powerThreePhase ? "3-phase" : "Single-phase",
    },
    { icon: Bath, label: "Washroom", value: shop.bathroom ? "Available" : "Not available" },
  ];

  return (
    <SpaceDetail
      space={shop}
      reviews={shopReviews[shop.id] ?? []}
      backHref="/search/shop"
      backLabel="Back to Shop Listings"
      sectionTitle="Shop"
      heroIcon={Store}
      specs={specs}
      badges={shop.highStreet ? ["High Street Unit"] : []}
    />
  );
}

export function generateStaticParams() {
  return shopListings.map((s) => ({ id: String(s.id) }));
}