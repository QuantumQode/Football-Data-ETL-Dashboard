"use client";

import { useEffect, useState, useRef } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export default function AnimatedCounter({
  value,
  duration = 1500,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startTime = useRef<number | null>(null);
  const animationFrame = useRef<number | null>(null);

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTime.current) {
        startTime.current = timestamp;
      }

      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      
      // Ease out cubic for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(easeOut * value);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    startTime.current = null;
    animationFrame.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
}
