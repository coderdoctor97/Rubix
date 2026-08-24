'use client';

/**
 * MidnightSky — a dim starfield + shooting stars background.
 *
 * Scoped to the Library (sidebar) panel and shown only in Special mode.
 * Rendered behind the library content (z-index: 0) with the content raised
 * above it, and stars kept at low opacity so they never fight the text.
 * Pure CSS — no images, no canvas, no JS animation loop.
 */
export default function MidnightSky() {
  return (
    <div className="midnight-sky" aria-hidden="true">
      <div className="midnight-sky__stars midnight-sky__stars--sm" />
      <div className="midnight-sky__stars midnight-sky__stars--md" />
      <div className="midnight-sky__stars midnight-sky__stars--lg" />
      <span className="midnight-sky__meteor midnight-sky__meteor--1" />
      <span className="midnight-sky__meteor midnight-sky__meteor--2" />
      <span className="midnight-sky__meteor midnight-sky__meteor--3" />
      <span className="midnight-sky__meteor midnight-sky__meteor--4" />
      <span className="midnight-sky__meteor midnight-sky__meteor--5" />
    </div>
  );
}
