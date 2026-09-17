"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BedDouble,
  Bath,
  Maximize,
  IndianRupee,
  Upload,
  Wifi,
  Car,
  ArrowUp,
  Shield,
  Camera,
  Dumbbell,
  Waves,
  TreePine,
  DoorOpen,
  Box,
} from "lucide-react";

const cities = [
  "Bangalore",
  "Mumbai",
  "Delhi",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

const amenitiesList = [
  { name: "WiFi", icon: Wifi },
  { name: "Parking", icon: Car },
  { name: "Lift", icon: ArrowUp },
  { name: "Power Backup", icon: Shield },
  { name: "CCTV", icon: Camera },
  { name: "Gym", icon: Dumbbell },
  { name: "Swimming Pool", icon: Waves },
  { name: "Garden", icon: TreePine },
  { name: "Servant Room", icon: DoorOpen },
  { name: "Store Room", icon: Box },
];

const bhkOptions = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5 BHK"];
const bathroomOptions = ["1", "2", "3", "4", "5"];
const propertyTypes = ["Apartment", "Independent House", "Villa", "Studio"];

export default function NewHouseListingPage() {
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [furnishing, setFurnishing] = useState("unfurnished");

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            href="/owner"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-light transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Add House for Rent
          </h1>
          <p className="text-sm text-muted mb-8">
            List your house or apartment for tenants
          </p>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Basic Info
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    House Name / Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Spacious 2BHK in Koramangala"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      placeholder="Start typing city..."
                      list="city-list"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                    <datalist id="city-list">
                      {cities.map((c) => (
                        <option key={c} value={c} />
                      ))}
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Locality / Area *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Koramangala 5th Block"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Full Address *
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Complete address with landmark"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Property Details
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <BedDouble className="w-4 h-4 inline mr-1" />
                      Bedrooms *
                    </label>
                    <select className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input">
                      <option value="">Select BHK</option>
                      {bhkOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Bath className="w-4 h-4 inline mr-1" />
                      Bathrooms *
                    </label>
                    <select className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input">
                      <option value="">Select</option>
                      {bathroomOptions.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <Maximize className="w-4 h-4 inline mr-1" />
                      Area (sqft) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1200"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Property Type *
                    </label>
                    <select className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input">
                      <option value="">Select type</option>
                      {propertyTypes.map((pt) => (
                        <option key={pt} value={pt}>
                          {pt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <ArrowUp className="w-4 h-4 inline mr-1" />
                      Floor
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Total Floors
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Rent & Deposit */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Rent & Deposit
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      Monthly Rent *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 25000"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      Security Deposit *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 50000"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <IndianRupee className="w-4 h-4 inline mr-1" />
                      Maintenance (₹/month)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 2000"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Available From
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Furnishing */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Furnishing
              </h2>
              <div className="flex gap-3">
                {["Unfurnished", "Semi-Furnished", "Fully Furnished"].map(
                  (option) => (
                    <button
                      key={option}
                      onClick={() => setFurnishing(option.toLowerCase())}
                      className={`px-6 py-3 rounded-xl text-sm font-medium border transition-all ${
                        furnishing === option.toLowerCase()
                          ? "bg-primary text-white border-primary neon-glow"
                          : "border-border text-muted hover:border-primary/50"
                      }`}
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Amenities
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {amenitiesList.map((amenity) => {
                  const Icon = amenity.icon;
                  const active = selectedAmenities.includes(amenity.name);
                  return (
                    <button
                      key={amenity.name}
                      onClick={() => toggleAmenity(amenity.name)}
                      className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-medium border transition-all ${
                        active
                          ? "bg-primary text-white border-primary"
                          : "border-border text-muted hover:border-primary/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {amenity.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photos */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Photos
              </h2>
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="w-10 h-10 text-muted mx-auto mb-3" />
                <p className="text-sm text-muted mb-2">
                  Drag and drop photos here, or click to upload
                </p>
                <p className="text-xs text-muted/60 mb-4">
                  PNG, JPG up to 5MB each. First photo will be the cover.
                </p>
                <button className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all neon-glow">
                  Choose Photos
                </button>
              </div>
            </div>

            {/* Description */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Description
              </h2>
              <textarea
                rows={5}
                placeholder="Describe your property, its features, neighbourhood, and what makes it special..."
                className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input resize-none"
              />
            </div>

            {/* Contact */}
            <div className="bg-surface rounded-xl border border-border p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Contact
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Landlord Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Full name"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 rounded-lg border border-border bg-surface-alt text-foreground text-sm focus:outline-none focus:border-primary search-input"
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4">
              <button className="px-8 py-3 rounded-xl bg-accent text-white font-semibold hover:bg-accent-light transition-all neon-glow">
                Submit for Review
              </button>
              <Link
                href="/owner"
                className="px-6 py-3 rounded-xl border border-border text-muted font-medium hover:bg-surface-alt transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
