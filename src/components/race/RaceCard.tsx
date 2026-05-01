"use client";

import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import type { Race } from "@/lib/types";
import { formatDate, getCountryFlag } from "@/lib/utils";

interface RaceCardProps {
  race: Race;
  index: number;
}

export default function RaceCard({ race, index }: RaceCardProps) {
  const flag = getCountryFlag(race.Circuit.Location.country);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.04 }}
    >
      <Link
        href={`/races/${race.season}/${race.round}`}
        id={`race-card-${race.season}-${race.round}`}
        className="glass-card group block h-full p-5"
      >
        {/* Round badge */}
        <div className="mb-3 flex items-center justify-between">
          <span className="rounded-md bg-f1-red/10 px-2 py-0.5 font-mono text-xs font-semibold text-f1-red">
            R{race.round.padStart(2, "0")}
          </span>
          <span className="text-2xl">{flag}</span>
        </div>

        {/* Race name */}
        <h3 className="mb-1 text-base font-semibold text-text-primary leading-snug group-hover:text-f1-red transition-colors">
          {race.raceName}
        </h3>

        {/* Circuit */}
        <p className="mb-3 flex items-center gap-1.5 text-sm text-text-secondary">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-text-muted" />
          <span className="truncate">{race.Circuit.circuitName}</span>
        </p>

        {/* Date */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar className="h-3 w-3" />
          {formatDate(race.date)}
        </div>
      </Link>
    </motion.div>
  );
}
