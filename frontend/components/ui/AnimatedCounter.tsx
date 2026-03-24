'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface Props {
  value: number;
  color: string;
}

export default function AnimatedCounter({ value, color }: Props) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (latest) => Math.round(latest));
  const [displayVal, setDisplayVal] = useState(0);

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayVal(latest);
    });
    return unsubscribe;
  }, [display]);

  return (
    <div className="text-3xl font-bold" style={{ color }}>
      {displayVal}
    </div>
  );
}
