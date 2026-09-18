"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RequireRole } from "@/components/RequireRole";
import { useSession } from "@/components/SessionProvider";
import type { PGRecord } from "@/lib/types";
import {
  Shield,
  ShieldCheck,
  Building2,
  CheckCircle,
  XCircle,
  Eye,
  Star,
  AlertTriangle,
  Clock,
  Search,
  LogOut,
  Trash2,
  MessageSquare,
  Phone,
  Mail,
  X,
  Heart,
} from "lucide-react";

interface ReviewRow {
  id: string;
  pgId: string;
  name: string;
  phone: string;
  email: string;
  rating: number;
  tags: string[];
  createdAt: string;
}

const statusColors: Record<string, string> = {
  approved: "bg-secondary/10 text-secondary border border-secondary/30",
  pending: "bg-accent/10 text-accent border border-accent/30",
  rejected: "bg-red-500/10 text-red-400 border border-red-500/30",
};

const staticUsers = [
  { id: "1", name: "Rajesh Kumar", email: "rajesh@example.com", role: "owner", joined: "Jan 2026" },
  { id: "2", name: "Priya Sharma", email: "priya@example.com", role: "owner", joined: "Feb 2026" },
  { id: "3", name: "Amit Patel", email: "amit@example.com", role: "owner", joined: "Mar 2026" },
  { id: "4", name: "Vikram Singh", email: "vikram@example.com", role: "owner", joined: "Mar 2026" },
  { id: "5", name: "Student User", email: "student@example.com", role: "user", joined: "Apr 2026" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { logout } = useSession();
  const [activeTab, setActiveTab] = useState<
    "overview" | "listings" | "users" | "pending" | "reviews"
  >("overview");
  const [listings, setListings] = useState<PGRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [selectedReview, setSelectedReview] = useState<ReviewRow | null>(null);

  const reload = async () => {
    const res = await fetch("/api/pg");
    if (res.ok) {
      const data = await res.json();
      setListings(data.listings);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pg")
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) {
          setListings(d.listings || []);
        }
      })
      .catch(() => {});
    fetch("/api/engagement")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (!cancelled && d) {
          setReviews(Array.isArray(d.reviews) ? (d.reviews as ReviewRow[]) : []);
          setLikes(typeof d.likes === "object" && d.likes !== null ? d.likes : {});
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const applyListing = (id: string, updated: PGRecord) => {
    setListings((prev) => prev.map((l) => (l.id === id ? updated : l)));
  };

  const handleStatus = async (id: string, status: "approved" | "rejected") => {
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch(`/api/pg/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data?.listing) applyListing(id, data.listing as PGRecord);
    } catch {
      await reload();
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const current = listings.find((l) => l.id === id);
    if (!current) return;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isFeatured: !l.isFeatured } : l))
    );
    try {
      const res = await fetch(`/api/pg/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current.isFeatured }),
      });
      const data = await res.json();
      if (data?.listing) applyListing(id, data.listing as PGRecord);
    } catch {
      await reload();
    }
  };

  const handleToggleVerified = async (id: string) => {
    const current = listings.find((l) => l.id === id);
    if (!current) return;
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isVerified: !l.isVerified } : l))
    );
    try {
      const res = await fetch(`/api/pg/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isVerified: !current.isVerified }),
      });
      const data = await res.json();
      if (data?.listing) applyListing(id, data.listing as PGRecord);
    } catch {
      await reload();
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}" listing? This cannot be undone.`)) return;
    setListings((prev) => prev.filter((l) => l.id !== id));
    try {
      const res = await fetch(`/api/pg/${id}`, { method: "DELETE" });
      if (!res.ok) await reload();
    } catch {
      await reload();
    }
  };

  const pendingRows = listings.filter((l) => l.status === "pending");
  const totalLikes = Object.values(likes).reduce((sum, n) => sum + (Number(n) || 0), 0);

  const filteredListings = listings.filter((l) => {
    if (!searchTerm) return true;
    const s = searchTerm.toLowerCase();
    return l.name.toLowerCase().includes(s) || l.city.toLowerCase().includes(s) || l.ownerName.toLowerCase().includes(s);
  });

  const recentRecords = [...listings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const listingName = (pgId: string) => {
    const l = listings.find((x) => x.id === pgId);
    return l ? `${l.name} — ${l.city}` : pgId;
  };

  return (
    <RequireRole role="ADMIN" fallbackHref="/" loginHref="/admin/login">
      <div className="bg-surface min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between gap-3 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-sm text-muted">Manage listings, users, and platform settings</p>
              </div>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace("/");
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface-alt text-sm font-medium text-foreground hover:border-accent hover:text-accent transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Listings", value: String(listings.length), icon: Building2, color: "text-primary" },
              { label: "Pending Approval", value: String(pendingRows.length), icon: Clock, color: "text-accent" },
              { label: "Reviews Received", value: String(reviews.length), icon: MessageSquare, color: "text-secondary" },
              { label: "Total Likes", value: String(totalLikes), icon: Heart, color: "text-red-500" },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-surface rounded-xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center">
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

          <div className="flex gap-1 bg-surface rounded-xl border border-border p-1 mb-6 w-fit overflow-x-auto">
            {(["overview", "pending", "listings", "users", "reviews"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                  activeTab === tab
                    ? "bg-accent text-white neon-glow"
                    : "text-muted hover:text-foreground hover:bg-surface"
                }`}
              >
                {tab}
                {tab === "pending" && pendingRows.length > 0 && (
                  <span className="ml-1.5 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                    {pendingRows.length}
                  </span>
                )}
                {tab === "reviews" && reviews.length > 0 && (
                  <span className="ml-1.5 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full">
                    {reviews.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Platform Growth</h3>
                <div className="flex items-end gap-2 h-48">
                  {[30, 45, 55, 40, 70, 85, 65, 90, 75, 95, 80, 100].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-secondary/20 rounded-t-md"
                        style={{ height: `${h}%` }}
                      >
                        <div
                          className="w-full bg-secondary rounded-t-md"
                          style={{ height: "40%" }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted mt-2">
                  <span>Jan</span>
                  <span>Jun</span>
                  <span>Dec</span>
                </div>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
                {recentRecords.length === 0 ? (
                  <p className="text-sm text-muted text-center py-6">No activity yet.</p>
                ) : (
                  <div className="space-y-3">
                    {recentRecords.map((r) => (
                      <div key={r.id} className="flex items-start gap-3 p-3 rounded-lg bg-surface">
                        <AlertTriangle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-foreground">
                            New listing submitted: {r.name}
                          </p>
                          <p className="text-xs text-muted">
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "pending" && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">
                  Pending Approval ({pendingRows.length})
                </h2>
              </div>
              <div className="divide-y divide-border">
                {pendingRows.map((listing) => (
                  <div key={listing.id} className="p-5 hover:bg-surface/50 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-7 h-7 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{listing.name}</h3>
                          <p className="text-sm text-muted">
                            Owner: {listing.ownerName} &middot; {listing.locality}, {listing.city}
                            {listing.state ? `, ${listing.state}` : ""}
                            {listing.pincode ? ` ${listing.pincode}` : ""}
                          </p>
                          {listing.address && (
                            <p className="text-sm text-muted mt-1">
                              Address: {listing.address}
                            </p>
                          )}
                          <p className="text-xs text-muted mt-1">
                            {listing.totalBeds} beds &middot; ₹{listing.priceMin.toLocaleString("en-IN")}/mo &middot; Submitted{" "}
                            {new Date(listing.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/pg/${listing.id}`}
                          className="p-2 rounded-lg hover:bg-surface transition-colors"
                        >
                          <Eye className="w-4 h-4 text-muted" />
                        </Link>
                        <button
                          onClick={() => handleStatus(listing.id, "approved")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-all neon-glow-green"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatus(listing.id, "rejected")}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id, listing.name)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/30 hover:bg-red-500/20 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingRows.length === 0 && (
                  <div className="p-10 text-center">
                    <CheckCircle className="w-10 h-10 text-secondary mx-auto mb-3" />
                    <p className="text-muted">No pending listings. You are all caught up!</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "listings" && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">All Listings</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 pr-4 py-2 rounded-lg border border-border bg-surface-alt text-foreground text-sm search-input focus:border-accent w-48"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Listing
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Status
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Rating
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Beds
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Featured
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Verified
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-medium text-foreground text-sm">{listing.name}</p>
                            <p className="text-xs text-muted">
                              {listing.ownerName} &middot; {listing.city}
                              {listing.state ? `, ${listing.state}` : ""}
                              {listing.pincode ? ` ${listing.pincode}` : ""}
                            </p>
                            {listing.address && (
                              <p className="text-xs text-muted mt-0.5 max-w-xs truncate">
                                {listing.address}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[listing.status]}`}
                          >
                            {listing.status}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-accent fill-accent" />
                            <span className="text-sm">{listing.rating || "\u2014"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-foreground">{listing.totalBeds}</td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => handleToggleFeatured(listing.id)}
                            aria-label={listing.isFeatured ? "Remove from featured" : "Mark as featured"}
                            className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                              listing.isFeatured ? "bg-accent neon-glow" : "bg-surface-dark"
                            }`}
                          >
                            <span
                              className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground shadow transition-transform ${
                                listing.isFeatured ? "left-5" : "left-0.5"
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleToggleVerified(listing.id)}
                              aria-label={listing.isVerified ? "Remove verified badge" : "Mark as verified"}
                              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                                listing.isVerified ? "bg-secondary neon-glow-green" : "bg-surface-dark"
                              }`}
                            >
                              <span
                                className={`absolute top-0.5 w-4 h-4 rounded-full bg-foreground shadow transition-transform ${
                                  listing.isVerified ? "left-5" : "left-0.5"
                                }`}
                              />
                            </button>
                            {listing.isVerified && (
                              <ShieldCheck className="w-4 h-4 text-secondary" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <Link
                              href={`/pg/${listing.id}`}
                              className="text-sm text-primary hover:underline"
                            >
                              View
                            </Link>
                            <button
                              onClick={() => handleDelete(listing.id, listing.name)}
                              aria-label={`Delete ${listing.name}`}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 text-sm font-medium border border-red-500/30 hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">All Users</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-surface">
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        User
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Role
                      </th>
                      <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase">
                        Joined
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {staticUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {u.name[0]}
                            </div>
                            <div>
                              <p className="font-medium text-foreground text-sm">{u.name}</p>
                              <p className="text-xs text-muted">{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                              u.role === "owner"
                                ? "bg-primary/10 text-primary-light border border-primary/30"
                                : "bg-surface-alt text-muted"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">{u.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="bg-surface rounded-xl border border-border overflow-hidden">
              <div className="p-5 border-b border-border flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">
                  Review Submissions ({reviews.length})
                </h2>
                <span className="text-xs text-muted">
                  Click Details to view the full submitted form
                </span>
              </div>
              {reviews.length === 0 ? (
                <div className="p-10 text-center">
                  <MessageSquare className="w-10 h-10 text-muted mx-auto mb-3" />
                  <p className="text-muted">No reviews yet. New submissions will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="p-5 hover:bg-surface/50 transition-colors"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center shrink-0">
                            <MessageSquare className="w-6 h-6 text-secondary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-foreground">{review.name}</h3>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((n) => (
                                  <Star
                                    key={n}
                                    className={`w-3.5 h-3.5 ${
                                      n <= review.rating
                                        ? "text-accent fill-accent"
                                        : "text-muted/30"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm text-muted mt-0.5">
                              For: {listingName(review.pgId)}
                            </p>
                            <p className="text-xs text-muted mt-1">
                              {new Date(review.createdAt).toLocaleString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-all neon-glow-green shrink-0"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-surface rounded-xl border border-border max-w-lg w-full max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-secondary" />
                Review Details
              </h3>
              <button
                onClick={() => setSelectedReview(null)}
                aria-label="Close"
                className="p-2 rounded-lg hover:bg-surface transition-colors"
              >
                <X className="w-5 h-5 text-muted" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs font-medium text-muted uppercase mb-1">Submitted For</p>
                <Link
                  href={`/pg/${selectedReview.pgId}`}
                  className="text-sm text-primary hover:underline font-medium"
                >
                  {listingName(selectedReview.pgId)}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted uppercase mb-1">Name</p>
                  <p className="text-sm font-medium text-foreground">{selectedReview.name}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted uppercase mb-1">Phone</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted" />
                    {selectedReview.phone}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs font-medium text-muted uppercase mb-1">Email</p>
                  <p className="text-sm font-medium text-foreground flex items-center gap-1.5 break-all">
                    <Mail className="w-3.5 h-3.5 text-muted shrink-0" />
                    {selectedReview.email}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`w-5 h-5 ${
                          n <= selectedReview.rating
                            ? "text-accent fill-accent"
                            : "text-muted/30"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {selectedReview.rating} / 5
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase mb-2">Highlights Selected</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedReview.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full bg-primary/10 text-primary-light text-xs font-medium border border-primary/30"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase mb-1">Submitted On</p>
                <p className="text-sm text-foreground">
                  {new Date(selectedReview.createdAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </RequireRole>
  );
}