import React, { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  startColor?: string;
  endColor?: string;
}

export const CountUp: React.FC<CountUpProps> = ({ end, duration = 1.5, startColor, endColor }) => {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState(startColor || 'inherit');

  const interpolateColor = (color1: string, color2: string, factor: number) => {
    if (!color1.startsWith('#') || !color2.startsWith('#')) return color2;
    
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    const r = Math.round(r1 + factor * (r2 - r1));
    const g = Math.round(g1 + factor * (g2 - g1));
    const b = Math.round(b1 + factor * (b2 - b1));
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / (duration * 1000), 1);
      
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(Math.floor(end * easeOut));
      
      if (startColor && endColor) {
        setColor(interpolateColor(startColor, endColor, percentage));
      }

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
        if (endColor) setColor(endColor);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, startColor, endColor]);

  return <span style={{ color }}>{count.toLocaleString('en-IN')}</span>;
};
