'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  Circle,
  Diamond,
  Hexagon,
  Octagon,
  Pentagon,
  Square,
  Triangle,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface FloatingShape {
  id: string;
  Icon?: LucideIcon;
  sizeClass: string;
  positionClass: string;
  outlineClass: string;
  animate: {
    x: number[];
    y: number[];
    rotate: number[];
  };
  duration: number;
  delay?: number;
}

const FLOATING_SHAPES: FloatingShape[] = [
  {
    id: 'circle-top-left',
    Icon: Circle,
    sizeClass: 'w-28 h-28',
    positionClass: 'top-[8%] left-[6%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.22]',
    animate: { x: [0, 46, -20, 0], y: [0, 30, -16, 0], rotate: [0, 45, 0] },
    duration: 24,
  },
  {
    id: 'diamond-top-center',
    Icon: Diamond,
    sizeClass: 'w-16 h-16',
    positionClass: 'top-[14%] left-[42%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, -38, 26, 0], y: [0, 42, -18, 0], rotate: [0, 120, 0] },
    duration: 28,
    delay: 1,
  },
  {
    id: 'dashed-ring-top-right',
    sizeClass: 'w-36 h-36 rounded-full border-[1.5px] border-dashed border-accent/[0.22] dark:border-accent/[0.24] bg-transparent',
    positionClass: 'top-[10%] right-[8%]',
    outlineClass: '',
    animate: { x: [0, -45, 15, 0], y: [0, 32, -20, 0], rotate: [0, 180, 360] },
    duration: 34,
  },
  {
    id: 'triangle-mid-left',
    Icon: Triangle,
    sizeClass: 'w-20 h-20',
    positionClass: 'top-[38%] left-[12%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, 52, -22, 0], y: [0, -36, 26, 0], rotate: [0, -90, 0] },
    duration: 26,
    delay: 2,
  },
  {
    id: 'hexagon-center',
    Icon: Hexagon,
    sizeClass: 'w-24 h-24',
    positionClass: 'top-[42%] left-[52%]',
    outlineClass: 'text-accent/[0.24] dark:text-accent/[0.25]',
    animate: { x: [0, -40, 32, 0], y: [0, -28, 36, 0], rotate: [0, 60, -30, 0] },
    duration: 30,
  },
  {
    id: 'circle-mid-center',
    Icon: Circle,
    sizeClass: 'w-24 h-24',
    positionClass: 'top-[62%] left-[38%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, 36, -24, 0], y: [0, -34, 24, 0], rotate: [0, 90, 0] },
    duration: 27,
    delay: 1.2,
  },
  {
    id: 'square-mid-right',
    Icon: Square,
    sizeClass: 'w-16 h-16',
    positionClass: 'top-[52%] right-[10%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, -34, 24, 0], y: [0, -44, 18, 0], rotate: [12, 102, 12] },
    duration: 22,
    delay: 1.5,
  },
  {
    id: 'pentagon-bottom-left',
    Icon: Pentagon,
    sizeClass: 'w-14 h-14',
    positionClass: 'bottom-[18%] left-[18%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, 44, -22, 0], y: [0, -30, 20, 0], rotate: [0, 90, 0] },
    duration: 25,
  },
  {
    id: 'triangle-bottom-center',
    Icon: Triangle,
    sizeClass: 'w-24 h-24',
    positionClass: 'bottom-[14%] left-[48%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, -42, 28, 0], y: [0, -26, 22, 0], rotate: [18, 120, 18] },
    duration: 29,
    delay: 0.8,
  },
  {
    id: 'octagon-bottom-right',
    Icon: Octagon,
    sizeClass: 'w-32 h-32',
    positionClass: 'bottom-[12%] right-[14%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, -48, 18, 0], y: [0, -38, 16, 0], rotate: [0, -75, 0] },
    duration: 32,
  },
  {
    id: 'square-upper-left',
    Icon: Square,
    sizeClass: 'w-14 h-14',
    positionClass: 'top-[28%] left-[26%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, 34, -28, 0], y: [0, 26, -24, 0], rotate: [0, 180, 0] },
    duration: 20,
    delay: 2.5,
  },
  {
    id: 'diamond-mid-card',
    Icon: Diamond,
    sizeClass: 'w-20 h-20',
    positionClass: 'top-[32%] left-[60%]',
    outlineClass: 'text-accent/[0.22] dark:text-accent/[0.24]',
    animate: { x: [0, -30, 38, 0], y: [0, 32, -26, 0], rotate: [0, -120, 0] },
    duration: 26,
    delay: 0.6,
  },
];

export default function AmbientGeometryBackground() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
    >
      {FLOATING_SHAPES.map((shape) => {
        const Icon = shape.Icon;
        return (
          <motion.div
            key={shape.id}
            className={`absolute ${shape.positionClass} ${Icon ? '' : shape.sizeClass}`}
            animate={
              prefersReducedMotion
                ? undefined
                : {
                    x: shape.animate.x,
                    y: shape.animate.y,
                    rotate: shape.animate.rotate,
                  }
            }
            transition={
              prefersReducedMotion
                ? undefined
                : {
                    duration: shape.duration,
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    delay: shape.delay || 0,
                  }
            }
          >
            {Icon ? (
              <Icon
                className={`${shape.sizeClass} ${shape.outlineClass}`}
                fill="none"
                strokeWidth={1.75}
              />
            ) : null}
          </motion.div>
        );
      })}
    </div>
  );
}
