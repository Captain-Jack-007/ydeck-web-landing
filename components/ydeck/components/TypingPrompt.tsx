import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

export function TypingPrompt({
  texts,
  speed = 34,
  pause = 1200,
}: {
  texts: string[];
  speed?: number;
  pause?: number;
}) {
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = texts[textIndex];

  useEffect(() => {
    if (reduceMotion) {
      setCharIndex(current.length);
      return undefined;
    }

    if (charIndex < current.length) {
      const timeout = window.setTimeout(
        () => setCharIndex((value) => value + 1),
        speed
      );
      return () => window.clearTimeout(timeout);
    }

    const timeout = window.setTimeout(() => {
      setCharIndex(0);
      setTextIndex((value) => (value + 1) % texts.length);
    }, pause);

    return () => window.clearTimeout(timeout);
  }, [charIndex, current.length, pause, reduceMotion, speed, texts.length]);

  return (
    <span>
      {current.slice(0, charIndex)}
      <span className="ml-0.5 animate-pulse text-ydeck-cyan">|</span>
    </span>
  );
}
