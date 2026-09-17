"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/components/SessionProvider";
import { ShieldAlert } from "lucide-react";

export function RequireRole({
  role,
  fallbackHref = "/dashboard",
  loginHref = "/auth/onboard",
  children,
}: {
  role: "USER" | "OWNER" | "ADMIN";
  fallbackHref?: string;
  loginHref?: string;
  children: ReactNode;
}) {
  const { user } = useSession();
  const router = useRouter();

  const ready = user !== null;
  const allowed = ready && user.role === role;

  useEffect(() => {
    if (!user) {
      router.replace(loginHref);
    } else if (user.role !== role) {
      router.replace(fallbackHref);
    }
  }, [user, role, fallbackHref, loginHref, router]);

  if (!allowed) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto animate-glow-border">
            <ShieldAlert className="w-7 h-7 text-primary-light animate-pulse" />
          </div>
          <p className="text-sm text-muted">Please wait...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}