'use client';
import {motion, useReducedMotion} from 'motion/react';

/* One-shot traveling "beam" along a cubic bezier.
   Triggered when `trigger` changes (node tint/status changed, or child created).
   Uses motion.pathLength for broad browser support.
   Pass `d` for normal direction (parent → child) or `dReverse` for reversed (child → parent). */
export default function AnimatedBeam({
  d,
  dReverse,
  trigger,
  color = 'var(--accent)',
  duration = 0.9,
}: {
  d: string;
  trigger: string | null;
  color?: string;
  duration?: number;
  dReverse?: string;
}) {
  // When marking a child, the pulse travels FROM the child node OUTWARD.
  const pathD = dReverse ?? d;
  const shouldReduceMotion = useReducedMotion();

  if (!trigger || shouldReduceMotion) {
    // Static fallback: a plain path in the accent color so the edge is still
    // visible and correctly coloured even when motion is disabled.
    return <path d={pathD} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" opacity={0.9} />;
  }

  return (
    <g>
      {/* soft trailing glow */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={7}
        strokeLinecap="round"
        opacity={0.18}
        initial={{pathLength: 0}}
        animate={{pathLength: 1}}
        transition={{duration: duration * 0.95, ease: 'easeInOut'}}
      />
      {/* bright traveling head */}
      <motion.path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={3.5}
        strokeLinecap="round"
        opacity={0.95}
        initial={{pathLength: 0}}
        animate={{pathLength: 1}}
        transition={{
          duration,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{filter: `drop-shadow(0 0 5px ${color})`}}
      />
    </g>
  );
}
