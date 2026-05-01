"use client";

import { Share2, Check } from "lucide-react";
import { useState } from "react";
import type { StrategyConfig } from "@/lib/types";

interface ShareButtonProps {
  config: StrategyConfig;
}

export default function ShareButton({ config }: ShareButtonProps) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/strategy/share", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Failed to save strategy");

      const data = await res.json();
      const shareUrl = `${window.location.origin}/strategy?sid=${data.id}`;
      
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error(error);
      alert("Failed to create share link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleShare}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-all ${
        copied
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-500"
          : "border-border-primary bg-bg-card text-text-primary hover:border-f1-red/40 hover:bg-bg-card-hover hover:text-f1-red disabled:opacity-50"
      }`}
    >
      {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
      {copied ? "Link Copied!" : loading ? "Saving..." : "Share Strategy"}
    </button>
  );
}
