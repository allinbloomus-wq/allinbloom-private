"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import styles from "@/components/not-found-bloom.module.css";

// Outer petals, drawn counter-clockwise so each one lies over its clockwise
// neighbour; the 300° petal is drawn once more, clipped to the top petal, to
// close the ring.
const PETALS = [
  { angle: 300, shade: "var(--p3)", delay: 1.05 },
  { angle: 240, shade: "var(--p2)", delay: 0.95 },
  { angle: 180, shade: "var(--p1)", delay: 0.85 },
  { angle: 120, shade: "var(--p3)", delay: 0.75 },
  { angle: 60, shade: "var(--p2)", delay: 0.65 },
  { angle: 0, shade: "var(--p1)", delay: 0.55 },
] as const;

function Petal({ angle, shade, delay }: (typeof PETALS)[number]) {
  return (
    <g transform={`rotate(${angle} 100 100)`}>
      <ellipse
        className={styles.petal}
        cx="100"
        cy="50"
        rx="31"
        ry="41"
        style={{ "--shade": shade, animationDelay: `${delay}s` } as CSSProperties}
      />
    </g>
  );
}

function Rose() {
  return (
    <svg className={styles.flower} viewBox="0 0 200 312" aria-hidden="true">
      <defs>
        <clipPath id="not-found-top-petal">
          <ellipse cx="100" cy="50" rx="31" ry="41" />
        </clipPath>
      </defs>
      <path className={styles.stem} d="M100 168 C 98 205, 108 240, 96 306" />
      <g transform="translate(101 236)">
        <path
          className={styles.leaf}
          d="M0 0 C 18 -34, 58 -42, 78 -30 C 64 -6, 30 10, 0 0 Z"
        />
        <path className={styles.leafVein} d="M6 -3 C 28 -16, 48 -22, 66 -26" />
      </g>
      <g className={styles.head}>
        <path
          className={styles.drift}
          d="M126 96 c 10 -10 24 -6 22 6 c -2 12 -16 16 -22 -6 z"
        />
        {PETALS.map((petal) => (
          <Petal key={petal.angle} {...petal} />
        ))}
        <g clipPath="url(#not-found-top-petal)">
          <Petal {...PETALS[0]} />
        </g>
        <circle className={styles.heart} cx="100" cy="100" r="22" />
        <circle className={styles.heartRing} cx="100" cy="100" r="22" />
      </g>
    </svg>
  );
}

const buttonBase =
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full px-7 text-xs font-semibold uppercase tracking-[0.2em] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]";

/** 404 content: a rose blooms as the "0", with a way back into the shop. */
export default function NotFoundBloom() {
  // Remounting the SVG replays its CSS animations.
  const [bloomKey, setBloomKey] = useState(0);

  return (
    <section className="mx-auto grid max-w-2xl justify-items-center gap-7 py-6 text-center sm:py-10">
      <div
        role="img"
        aria-label="404"
        className="flex select-none items-start justify-center gap-[clamp(4px,1.5vw,14px)] text-[clamp(88px,24vw,184px)] font-bold leading-[0.82] tracking-[-0.03em] text-stone-900"
      >
        <span aria-hidden="true" className="pt-[0.04em]">
          4
        </span>
        <Rose key={bloomKey} />
        <span aria-hidden="true" className="pt-[0.04em]">
          4
        </span>
      </div>

      <h1 className="text-balance text-2xl font-semibold text-stone-900 sm:text-3xl">
        This page is not in bloom
      </h1>
      <p className="max-w-[46ch] text-pretty text-sm leading-relaxed text-stone-600 sm:text-base">
        The link may be old, or the bouquet sold out and left the catalog.
        Fresh arrangements are made every day at our studio on Milwaukee Ave in
        Wheeling, IL.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/catalog?entry=1"
          className={`${buttonBase} group bg-[color:var(--brand)] text-white shadow-[0_12px_28px_rgba(var(--brand-rgb),0.28)] hover:-translate-y-0.5 hover:bg-[color:var(--brand-dark)]`}
        >
          Shop bouquets
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M4 10h12M11 5l5 5-5 5" />
          </svg>
        </Link>
        <Link
          href="/"
          className={`${buttonBase} border border-[color:var(--brand)]/30 bg-white/70 text-[color:var(--brand)] hover:border-[color:var(--brand)]/60`}
        >
          Back to home
        </Link>
      </div>

      <p className="text-[11px] uppercase tracking-[0.24em] text-stone-500">
        Error 404 ·{" "}
        <button
          type="button"
          onClick={() => setBloomKey((key) => key + 1)}
          className="rounded-sm uppercase tracking-[0.24em] underline decoration-stone-300 underline-offset-4 transition hover:text-[color:var(--brand)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--brand)]"
        >
          Watch it bloom again
        </button>
      </p>
    </section>
  );
}
