"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/SessionProvider";
import type { PGRecord } from "@/lib/types";
import {
  Building2,
  Plus,
  Edit3,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
} from "lucide-react";

const statusColors: Record<string, string> = {
  approved: "bg-secondary/10 text-secondary border border-secondary/30",
  pending: "bg-accent/10 text-accent border border-accent/30",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/30",
};

export default function OwnerDashboard() {
  const { user } = useSession();
  const [listings, setListings] = useState<PGRecord[]>([]);
  const [pendingDelete, setPendingDelete] = useState<PGRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.name) return;
    const params = new URLSearchParams({ ownerName: user.name });
    fetch(`/api/pg?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setListings(d.listings || []);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [user?.name]);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      await fetch(`/api/pg/${pendingDelete.id}`, { method: "DELETE" });
      setListings((prev) => prev.filter((l) => l.id !== pendingDelete.id));
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  };

  return (
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Owner Dashboard</h1>
              <p className="text-sm text-muted mt-1">Manage your PG listings and track performance</p>
            </div>
            <Link
              href="/owner/listings/new"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary-light transition-all neon-glow"
            >
              <Plus className="w-5 h-5" />
              Add New PG
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Listings", value: String(listings.length), icon: Building2, color: "text-primary" },
              { label: "Approved", value: String(listings.filter((l) => l.status === "approved").length), icon: CheckCircle2, color: "text-secondary" },
              { label: "Pending", value: String(listings.filter((l) => l.status === "pending").length), icon: Clock, color: "text-accent" },
              { label: "Beds", value: listings.reduce((sum, l) => sum + l.totalBeds, 0).toLocaleString(), icon: Users, color: "text-primary" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-surface flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{value}</p>
                    <p className="text-xs text-muted">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Your Listings</h2>
            </div>
            {listings.length === 0 ? (
              <div className="p-10 text-center">
                <Building2 className="w-10 h-10 text-primary/30 mx-auto mb-3" />
                <p className="text-sm text-muted">No listings yet. Add your first PG to get started.</p>
                <Link
                  href="/owner/listings/new"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary-light hover:underline"
                >
                  <Plus className="w-4 h-4" />
                  Add New PG
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {listings.map((listing) => (
                  <div key={listing.id} className="p-5 hover:bg-surface/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-surface-alt flex items-center justify-center shrink-0">
                          <Building2 className="w-7 h-7 text-muted" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{listing.name}</h3>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[listing.status]}`}
                            >
                              {listing.status}
                            </span>
                          </div>
                          <p className="text-sm text-muted">
                            {listing.locality}, {listing.city}
                          </p>
                          <p className="text-xs text-muted mt-1">
                            ₹{listing.priceMin.toLocaleString("en-IN")}/mo &middot; {listing.totalBeds} beds
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-center hidden md:block">
                          <p className="font-medium text-foreground">
                            {listing.rating > 0 ? listing.rating : "\u2014"}
                          </p>
                          <p className="text-xs text-muted">Rating</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/owner/listings/${listing.id}/edit`}
                            className="p-2 rounded-lg hover:bg-surface transition-colors"
                            title="Edit listing"
                          >
                            <Edit3 className="w-4 h-4 text-muted" />
                          </Link>
                          <button
                            onClick={() => setPendingDelete(listing)}
                            className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                            title="Delete listing"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {pendingDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <div className="bg-surface rounded-xl border border-border shadow-xl max-w-md w-full p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Confirm Delete</h3>
                <p className="text-sm text-muted">
                  Are you sure you want to permanently delete{" "}
                  <strong className="text-foreground">{pendingDelete.name}</strong>? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => setPendingDelete(null)}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted hover:bg-surface transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all disabled:opacity-60"
                  >
                    {deleting ? "Deleting..." : "Delete Permanently"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
}