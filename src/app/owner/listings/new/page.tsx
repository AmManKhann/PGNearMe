"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, CheckCircle2 } from "lucide-react";
import { ListingForm, type ListingFormValues } from "@/components/ListingForm";
import { useSession } from "@/components/SessionProvider";

export default function NewListingPage() {
  const router = useRouter();
  const { user } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = async (values: ListingFormValues) => {
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/pg", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, ownerName: user?.name || "" }),
      });
      if (!res.ok) {
        setError("Failed to submit listing. Please try again.");
        return;
      }
      setName(values.name);
      setSubmitted(true);
    } catch {
      setError("Failed to submit listing. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-secondary/10 border border-secondary/30 rounded-xl p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-secondary mx-auto mb-3" />
          <h2 className="text-lg font-bold text-foreground mb-1">
            Listing Submitted!
          </h2>
          <p className="text-sm text-muted mb-6">
            Your PG <strong className="text-foreground">{name}</strong> has been sent for
            admin review. You will be able to see it in your dashboard once approved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => router.push("/owner")}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-light transition-all neon-glow"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setError("");
                setFormKey((k) => k + 1);
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg border border-border text-muted text-sm font-medium hover:bg-surface transition-colors"
            >
              Add Another
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        <h1 className="text-2xl font-bold text-foreground mb-2">Add New PG Listing</h1>
        <p className="text-sm text-muted mb-8">Fill in the details to list your property</p>

        <ListingForm
          key={formKey}
          onSubmit={handleSubmit}
          onCancel={() => router.push("/owner")}
          error={error}
          submitting={submitting}
        />
      </div>
    </div>
  );
}