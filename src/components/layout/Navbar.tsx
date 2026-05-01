"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { motion } from "framer-motion";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/races", label: "Race Explorer" },
  { href: "/strategy", label: "Strategy Lab" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      id="main-nav"
      className="glass fixed top-0 right-0 left-0 z-50"
      style={{ height: "var(--nav-height)" }}
    >
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 transition-colors hover:opacity-80"
        >
          <div className="flex h-10 w-14 items-center justify-center bg-f1-red text-white f1-clip-button shadow-[0_0_15px_rgba(225,6,0,0.4)]">
            <span
              className="text-xl font-black italic tracking-tighter"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              R-F1
            </span>
          </div>
          <div className="hidden sm:flex flex-col justify-center">
            <span
              className="text-sm font-bold uppercase tracking-widest text-text-primary"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              R-F1 Platform
            </span>
            <span className="text-[10px] font-medium tracking-[0.2em] text-f1-red">
              REZ3X-F1
            </span>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative px-2 py-2 text-sm font-bold uppercase tracking-wider transition-colors duration-200 heading-font hover:text-text-primary ${
                isActive(link.href)
                  ? "text-text-primary"
                  : "text-text-secondary"
              }`}
            >
              <span className="relative z-10">{link.label}</span>
              {isActive(link.href) && (
                <motion.span
                  layoutId="navbar-indicator"
                  className="absolute -bottom-1 left-0 h-[3px] w-full bg-f1-red shadow-[0_0_10px_rgba(225,6,0,0.8)]"
                />
              )}
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Mobile menu toggle */}
          <button
            type="button"
            id="mobile-menu-toggle"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-card-hover md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass border-t border-border-subtle md:hidden">
          <div className="space-y-1 px-4 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "bg-f1-red/10 text-f1-red"
                    : "text-text-secondary hover:bg-bg-card-hover hover:text-text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
