import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { FindPGAction } from "@/components/FindPGAction";

export function Footer() {
  return (
    <footer className="bg-surface-dark border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <BrandLogo size="lg" />
            <p className="text-sm text-muted leading-relaxed">
              India&apos;s most trusted platform for finding PG, hostel, and paying guest
              accommodations. Direct owner contact, verified listings.
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <FindPGAction variant="link" />
              </li>
              <li>
                <Link href="/owner" className="text-muted hover:text-primary-light transition-colors">
                  List Your PG
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted">
                <Mail className="w-4 h-4 text-secondary" />
                supportpgnearme@gmail.com
              </li>
              <li className="flex items-center gap-2 text-muted">
                <Phone className="w-4 h-4 text-secondary" />
                +91 93515 24550
              </li>
              <li className="flex items-start gap-2 text-muted">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                <span>Bangalore, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} PGNearMe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}