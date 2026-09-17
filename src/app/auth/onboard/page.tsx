"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, User as UserIcon, Store, ArrowRight } from "lucide-react";
import { useSession } from "@/components/SessionProvider";

const roleHome = (role?: string) =>
  role === "OWNER" ? "/owner" : role === "ADMIN" ? "/admin/dashboard" : "/dashboard";

function OnboardForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useSession();

  const nextParam = searchParams.get("next");
  const safeNext =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : null;
  const ownerIntent = searchParams.get("role") === "owner";

  const destination = (role: string) => safeNext || roleHome(role);

  const enterAs = (name: string, role: "USER" | "OWNER") => {
    login({
      id: role === "OWNER" ? "u2" : "u1",
      name,
      email: role === "OWNER" ? "demo@owner.com" : "demo@user.com",
      phone: role === "OWNER" ? "9876543210" : undefined,
      role,
    });
    router.push(destination(role));
  };

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl border border-border shadow-lg shadow-black/20 p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4 neon-glow">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {ownerIntent ? "List Your PG" : "Get Started"}
            </h1>
            <p className="text-sm text-muted mt-1">
              {ownerIntent
                ? "Own a PG? Sign in to create your free listing."
                : "Choose how you want to continue. No account needed."}
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => enterAs("User", "USER")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <span className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <UserIcon className="w-4 h-4 text-primary-light" />
                </span>
                Continue as User
              </span>
              <ArrowRight className="w-4 h-4 text-muted" />
            </button>
            <button
              onClick={() => enterAs("Demo Owner", "OWNER")}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-surface border border-border hover:border-primary/50 transition-colors"
            >
              <span className="flex items-center gap-2.5 text-sm font-medium text-foreground">
                <span className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <Store className="w-4 h-4 text-secondary" />
                </span>
                Continue as PG Owner
              </span>
              <ArrowRight className="w-4 h-4 text-muted" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OnboardPage() {
  return (
    <Suspense fallback={null}>
      <OnboardForm />
    </Suspense>
  );
}