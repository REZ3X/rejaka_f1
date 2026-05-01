"use client";

import { motion } from "framer-motion";
import { ArrowRight, BarChart3, FlaskConical, Gauge } from "lucide-react";
import Link from "next/link";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Race Explorer",
    description:
      "Dive into real race data. Visualize lap times, position changes, and pit stop strategies from any Grand Prix.",
    href: "/races",
    color: "#3671C6",
  },
  {
    icon: FlaskConical,
    title: "Strategy Lab",
    description:
      "Build your own tire strategy. Adjust pit stops, tire compounds, and see how it compares to what actually happened.",
    href: "/strategy",
    color: "#e10600",
  },
  {
    icon: Gauge,
    title: "Compare Strategies",
    description:
      "Pit two strategies against each other. See gap evolution lap-by-lap and find the optimal approach.",
    href: "/strategy/compare",
    color: "#FF8000",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero Section */}
      <section className="gradient-hero grid-bg relative flex min-h-[85vh] items-center justify-center overflow-hidden px-4">
        {/* Animated glow orb */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, var(--f1-red) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 className="mb-6 text-6xl font-black uppercase italic leading-tight tracking-tighter sm:text-7xl lg:text-8xl heading-font drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <span className="text-f1-red">Analyze.</span>{" "}
              <span style={{ color: "var(--hero-simulate)" }}>Simulate.</span>
              <br />
              <span
                className="text-[#15151e]"
                style={{
                  WebkitTextStroke: "1px rgba(255,255,255,0.8)",
                  textShadow: "0 0 20px rgba(255,255,255,0.1)",
                }}
              >
                Dominate.
              </span>
            </h1>

            <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl font-medium">
              Your personal race engineer interface. Access historical
              telemetry, simulate tire degradation, and build the ultimate race
              strategy.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/races"
                className="group inline-flex items-center gap-2 bg-f1-red px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(225,6,0,0.4)] transition-all duration-300 hover:bg-f1-red-dark hover:shadow-[0_0_30px_rgba(225,6,0,0.6)] skew-btn"
              >
                <span>
                  Access Telemetry
                  <ArrowRight className="inline ml-2 h-5 w-5 transition-transform group-hover:translate-x-2" />
                </span>
              </Link>
              <Link
                href="/strategy"
                className="inline-flex items-center gap-2 border-2 border-border-primary bg-bg-card/80 px-8 py-4 text-sm font-black uppercase tracking-widest text-text-primary backdrop-blur-sm transition-all duration-300 hover:border-f1-red/60 hover:bg-bg-card skew-btn"
              >
                <span>Enter Lab</span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Bottom glow line */}
        <div className="glow-line absolute right-0 bottom-0 left-0" />
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-4 text-3xl font-bold text-text-primary sm:text-4xl">
              Think like a race engineer
            </h2>
            <p className="mx-auto max-w-xl text-text-secondary">
              Three powerful tools to understand F1 strategy at a deeper level
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {FEATURES.map((feature, idx) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
              >
                <Link href={feature.href} className="block h-full">
                  <div className="glass-card group flex h-full flex-col p-6">
                    <div
                      className="mb-4 flex h-14 w-14 items-center justify-center skew-btn"
                      style={{
                        backgroundColor: `${feature.color}`,
                        color: "#fff",
                        boxShadow: `0 0 15px ${feature.color}40`,
                      }}
                    >
                      <feature.icon className="h-7 w-7 skew-btn" />
                    </div>
                    <h3 className="mb-2 text-xl font-black uppercase italic tracking-wider text-text-primary heading-font">
                      {feature.title}
                    </h3>
                    <p className="flex-1 text-sm leading-relaxed text-text-secondary">
                      {feature.description}
                    </p>
                    <div
                      className="mt-6 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors group-hover:gap-3"
                      style={{ color: feature.color }}
                    >
                      Initialize Module
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Preview */}
      <section className="border-t border-border-subtle bg-bg-secondary/30 py-20 px-4">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "25+", label: "Seasons of Data" },
              { value: "1000+", label: "Grand Prix Races" },
              { value: "∞", label: "Strategy Combos" },
              { value: "Real", label: "Lap-by-Lap Data" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="mb-1 font-mono text-3xl font-bold text-f1-red sm:text-4xl">
                  {stat.value}
                </div>
                <div className="text-sm text-text-secondary">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
