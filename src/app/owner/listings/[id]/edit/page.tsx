"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, AlertCircle } from "lucide-react";
import { ListingForm, type ListingFormValues } from "@/components/ListingForm";
import type { PGRecord } from "@/lib/types";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [listing, setListing] = useState<PGRecord | null>(null);
  const [error, setError] = useState("");
  const [apiError, setApiError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/pg/${params.id}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        if (!cancelled) setListing(data.listing);
      } catch {
        if (!cancelled) setError("Listing not found or failed to load.");
      }
    })();
    return () => { cancelled = true; };
  }, [params.id]);

  if (error) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center px-4 py-8">
        <div className="text-center space-y-3">
          <AlertCircle className="w-12 h-12 text-muted mx-auto" />
          <p className="text-muted">{error}</p>
          <Link href="/owner" className="text-sm text-primary-light hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center px-4 py-8">
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  const handleSubmit = async (values: ListingFormValues) => {
    setApiError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/pg/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values }),
      });
      if (!res.ok) {
        setApiError("Failed to update listing. Please try again.");
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem("pgnearme_owner_name", values.ownerName || "");
      }
      router.push("/owner");
    } catch {
      setApiError("Failed to update listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/owner"
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-primary-light transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-2">
          Edit <span className="text-primary-light">{listing.name}</span>
        </h1>
        <p className="text-sm text-muted mb-8">Update your listing details below</p>

        <ListingForm
          initialData={listing}
          submitLabel="Save Changes"
          onSubmit={handleSubmit}
          onCancel={() => router.push("/owner")}
          error={apiError}
          submitting={submitting}
        />
      </div>
    </div>
  );
}