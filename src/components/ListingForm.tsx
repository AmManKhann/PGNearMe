"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";
import type { PGRecord } from "@/lib/types";
import { parseMapsCoords } from "@/lib/mapscoords";

const defaultAmenities = [
  "WiFi",
  "Food (3 meals)",
  "Food (2 meals)",
  "AC Rooms",
  "Laundry",
  "Power Backup",
  "CCTV",
  "Hot Water",
  "Housekeeping",
  "Gym",
  "Parking",
  "Room Service",
];

const famousCities = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
  "Jaipur",
  "Lucknow",
  "Surat",
  "Kochi",
];

const indiaStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export interface PricingRowState {
  type: string;
  price: string;
  meals: string;
}

export interface ListingFormValues {
  name: string;
  city: string;
  state: string;
  pincode: string;
  locality: string;
  address: string;
  description: string;
  gender: "male" | "female" | "unisex";
  totalBeds: number;
  amenities: string[];
  pricing: { type: string; price: number; meals: string }[];
  phone?: string;
  whatsapp?: string;
  website?: string;
  mapsUrl?: string;
  ownerName?: string;
  images: string[];
  videos: string[];
  lat?: number;
  lng?: number;
}

interface ListingFormProps {
  initialData?: PGRecord;
  submitLabel?: string;
  onSubmit: (values: ListingFormValues) => void;
  onCancel?: () => void;
  error?: string;
  submitting?: boolean;
}

export function ListingForm({
  initialData,
  submitLabel = "Submit for Review",
  onSubmit,
  onCancel,
  error,
  submitting = false,
}: ListingFormProps) {
  const [name, setName] = useState(initialData?.name ?? "");
  const [city, setCity] = useState(initialData?.city ?? "");
  const [state, setState] = useState(initialData?.state ?? "");
  const [pincode, setPincode] = useState(initialData?.pincode ?? "");
  const [locality, setLocality] = useState(initialData?.locality ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [gender, setGender] = useState<"" | "male" | "female" | "unisex">(
    initialData?.gender ?? ""
  );
  const [totalBeds, setTotalBeds] = useState(initialData ? String(initialData.totalBeds) : "");
  const [phone, setPhone] = useState(initialData?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [website, setWebsite] = useState(initialData?.website ?? "");
  const [mapsUrl, setMapsUrl] = useState(initialData?.mapsUrl ?? "");
  const [ownerName, setOwnerName] = useState(initialData?.ownerName ?? "");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialData?.amenities ?? []
  );
  const [pricingRows, setPricingRows] = useState<PricingRowState[]>(
    initialData?.pricing?.length
      ? initialData.pricing.map((p) => ({
          type: p.type,
          price: String(p.price),
          meals: p.meals,
        }))
      : [{ type: "Triple Sharing", price: "", meals: "3 meals" }]
  );
  const [mediaImages, setMediaImages] = useState<string[]>(initialData?.images ?? []);
  const [mediaVideos, setMediaVideos] = useState<string[]>(initialData?.videos ?? []);
  const [formError, setFormError] = useState("");

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const addPricingRow = () => {
    setPricingRows((prev) => [...prev, { type: "", price: "", meals: "" }]);
  };

  const removePricingRow = (index: number) => {
    setPricingRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setFormError("");
    if (!name.trim() || !city.trim() || !state.trim() || !locality.trim() || !address.trim()) {
      setFormError("Please fill in PG name, city, state, locality and full address.");
      return;
    }
    if (pincode.trim() && !/^\d{6}$/.test(pincode.trim())) {
      setFormError("Pincode must be a 6-digit number.");
      return;
    }
    if (!ownerName.trim()) {
      setFormError("Please enter your name so you can track this listing.");
      return;
    }
    if (!gender) {
      setFormError("Please select the gender type.");
      return;
    }
    if (!totalBeds || parseInt(totalBeds, 10) <= 0) {
      setFormError("Please enter total beds.");
      return;
    }
    const validPricing = pricingRows.filter(
      (r) => r.type.trim() && parseFloat(r.price) > 0
    );
    if (validPricing.length === 0) {
      setFormError("Add at least one room type with a valid price.");
      return;
    }
    onSubmit({
      name: name.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      locality: locality.trim(),
      address: address.trim(),
      description:
        description.trim() ||
        `${name.trim()} paying guest accommodation in ${locality.trim()}, ${city.trim()}.`,
      gender: gender as "male" | "female" | "unisex",
      totalBeds: parseInt(totalBeds, 10),
      amenities: selectedAmenities,
      pricing: validPricing.map((r) => ({
        type: r.type.trim(),
        price: parseFloat(r.price),
        meals: r.meals.trim() || "3 meals",
      })),
      phone: phone.trim() || undefined,
      whatsapp: whatsapp.trim() || undefined,
      website: ["na", "n/a", "none"].includes(website.trim().toLowerCase())
        ? undefined
        : website.trim() || undefined,
      mapsUrl: mapsUrl.trim() || undefined,
      lat: parseMapsCoords(mapsUrl)?.lat,
      lng: parseMapsCoords(mapsUrl)?.lng,
      ownerName: ownerName.trim(),
      images: mediaImages,
      videos: mediaVideos,
    });
  };

  const shownError = formError || error;

  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Basic Details</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              PG / Hostel Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Sunshine Boys PG"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Your Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Ramesh Kumar"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                City *
              </label>
              <input
                type="text"
                placeholder="e.g. Mysuru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                list="famous-cities"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
              <datalist id="famous-cities">
                {famousCities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                State *
              </label>
              <input
                type="text"
                placeholder="e.g. Rajasthan"
                value={state}
                onChange={(e) => setState(e.target.value)}
                list="india-states"
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
              <datalist id="india-states">
                {indiaStates.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Locality / Area *
              </label>
              <input
                type="text"
                placeholder="e.g. Koramangala"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Pincode
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 560034"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Full Address *
            </label>
            <textarea
              rows={2}
              placeholder="Complete address with landmark"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Google Maps Location Link
            </label>
            <input
              type="url"
              placeholder="Paste Google Maps URL here"
              value={mapsUrl}
              onChange={(e) => setMapsUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
            <p className="mt-1 text-xs text-muted">
              Paste the Google Maps link to show the exact location and enable turn-by-turn navigation.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe your property, its features, and what makes it special..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Property Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Gender *
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value as typeof gender)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            >
              <option value="">Select</option>
              <option value="male">Boys Only</option>
              <option value="female">Girls Only</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Total Beds *
            </label>
            <input
              type="number"
              placeholder="e.g. 60"
              value={totalBeds}
              onChange={(e) => setTotalBeds(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-foreground mb-1">
              Contact Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 00000 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              WhatsApp Number
            </label>
            <input
              type="tel"
              placeholder="e.g. +91 00000 00000"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Website Link
            </label>
            <input
              type="url"
              placeholder="e.g. https://www.yourpg.com — type NA if no website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Pricing</h2>
          <button
            onClick={addPricingRow}
            className="flex items-center gap-1 text-sm text-primary-light hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add Room Type
          </button>
        </div>
        <div className="space-y-3">
          {pricingRows.map((row, index) => (
            <div
              key={index}
              className={`${
                pricingRows.length > 1
                  ? "grid grid-cols-2 sm:grid-cols-[1fr_auto_auto] gap-2 items-center"
                  : "flex flex-wrap sm:flex-nowrap gap-2 items-center"
              }`}
            >
              <input
                type="text"
                placeholder="Room type (e.g. Double Sharing)"
                value={row.type}
                onChange={(e) => {
                  const newRows = [...pricingRows];
                  newRows[index].type = e.target.value;
                  setPricingRows(newRows);
                }}
                className="w-full px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
              <input
                type="number"
                placeholder="Price/month"
                value={row.price}
                onChange={(e) => {
                  const newRows = [...pricingRows];
                  newRows[index].price = e.target.value;
                  setPricingRows(newRows);
                }}
                className="w-full sm:w-32 px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
              <input
                type="text"
                placeholder="Meals"
                value={row.meals}
                onChange={(e) => {
                  const newRows = [...pricingRows];
                  newRows[index].meals = e.target.value;
                  setPricingRows(newRows);
                }}
                className="w-full sm:w-28 px-4 py-2.5 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-primary"
              />
              {pricingRows.length > 1 && (
                <button
                  onClick={() => removePricingRow(index)}
                  className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {defaultAmenities.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                selectedAmenities.includes(amenity)
                  ? "bg-primary text-white border-primary neon-glow"
                  : "border-border text-muted hover:border-primary/50 hover:text-foreground"
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-xl border border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Photos &amp; Videos
        </h2>
        <MediaUpload
          initialImages={initialData?.images ?? []}
          initialVideos={initialData?.videos ?? []}
          onChange={(images, videos) => {
            setMediaImages(images);
            setMediaVideos(videos);
          }}
        />
      </div>

      <div className="flex items-center gap-4">
        {shownError && <p className="text-sm text-red-500">{shownError}</p>}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="px-8 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all neon-glow disabled:opacity-60"
        >
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-6 py-3 rounded-xl border border-border text-muted font-medium hover:bg-surface transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}