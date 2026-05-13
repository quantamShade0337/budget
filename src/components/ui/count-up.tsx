"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  animateOnMount?: boolean;
  className?: string;
}

export function CountUp({
  value,
  duration = 550,
  format = (n) => n.toFixed(2),
  animateOnMount = true,
  className,
}: CountUpProps) {
  const [display, setDisplay] = useState(animateOnMount ? 0 : value);
  const displayRef = useRef(animateOnMount ? 0 : value);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    displayRef.current = display;
  }, [display]);

  useEffect(() => {
    const startVal = displayRef.current;
    const endVal = value;

    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    if (Math.abs(startVal - endVal) < 0.001) {
      setDisplay(endVal);
      return;
    }

    const t0 = performance.now();

    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const v = startVal + (endVal - startVal) * eased;
      setDisplay(v);
      if (t < 1) animRef.current = requestAnimationFrame(tick);
      else {
        setDisplay(endVal);
        animRef.current = null;
      }
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}
