import { notFound } from "next/navigation";
import { SpaceDetail, type SpaceDetailSpec } from "@/components/SpaceDetail";
import { officeListings, officeReviews, getOfficeById } from "@/lib/spaces";
import { Briefcase, Maximize, Users, Bath, Car } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const office = getOfficeById(id);
  if (!office) return { title: "Office Not Found | PG Near Me" };
  return { title: `${office.name} | Office for Rent` };
}

export default async function OfficeDetailPage({ params }: Props) {
  const { id } = await params;
  const office = getOfficeById(id);
  if (!office) notFound();

  const specs: SpaceDetailSpec[] = [
    { icon: Maximize, label: "Area", value: `${office.areaSqft} sqft` },
    { icon: Users, label: "Seating", value: `${office.seating} seats` },
    { icon: Bath, label: "Bathrooms", value: `${office.bathrooms}` },
    { icon: Car, label: "Parking", value: office.parking ? "Available" : "Not available" },
    {
      icon: Briefcase,
      label: "Fit-out",
      value: office.furnished ? "Fully furnished" : "Shell / Unfurnished",
    },
  ];

  return (
    <SpaceDetail
      space={office}
      reviews={officeReviews[office.id] ?? []}
      backHref="/search/office"
      backLabel="Back to Office Listings"
      sectionTitle="Office"
      heroIcon={Briefcase}
      specs={specs}
      badges={office.furnished ? ["Furnished Office"] : ["Shell Space"]}
    />
  );
}

export function generateStaticParams() {
  return officeListings.map((o) => ({ id: String(o.id) }));
}