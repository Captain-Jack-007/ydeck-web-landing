import type { ReactNode } from 'react';
import { useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

import { ease } from '../constants';

export function WordsPullUp({
  text,
  className,
  highlightWords = [],
}: {
  text: string;
  className?: string;
  highlightWords?: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.25 });
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  return (
    <div ref={ref} className={className}>
      {words.map((word, index) => {
        const highlight = highlightWords.includes(word);
        const isDeck = word.toLowerCase().startsWith('deck');

        return (
          <motion.span
            key={`${word}-${index}`}
            className={`relative mr-[0.18em] inline-block pb-2 ${
              highlight ? 'text-white' : ''
            }`}
            initial={
              reduceMotion ? false : { opacity: 0, y: 32 }
            }
            animate={
              inView ? { opacity: 1, y: 0 } : undefined
            }
            transition={{
              duration: reduceMotion ? 0 : 0.75,
              delay: index * 0.06,
              ease,
            }}
          >
            {word}
            {isDeck && (
              <motion.span
                className="absolute bottom-1 left-0 h-1 w-full rounded-full bg-ydeck-cyan/65"
                initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
                animate={
                  inView ? { scaleX: [0, 1, 0.88, 1], opacity: 1 } : undefined
                }
                transition={{ duration: 1.2, delay: 0.9, ease }}
                style={{ transformOrigin: 'left' }}
              />
            )}
          </motion.span>
        );
      })}
    </div>
  );
}

export function FadeUp({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.22 });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={
        reduceMotion ? false : { opacity: 0, y: 28 }
      }
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduceMotion ? 0 : 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
