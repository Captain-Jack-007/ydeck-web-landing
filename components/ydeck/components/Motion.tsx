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
  const animateVisible = reduceMotion || inView;

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
            initial={false}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduceMotion ? 0 : 0.75,
              delay: animateVisible ? index * 0.06 : 0,
              ease,
            }}
          >
            {word}
            {isDeck && (
              <motion.span
                className="absolute bottom-1 left-0 h-1 w-full rounded-full bg-ydeck-cyan/65"
                initial={false}
                animate={
                  animateVisible
                    ? { scaleX: [0, 1, 0.88, 1], opacity: 1 }
                    : { scaleX: 1, opacity: 1 }
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
  const animateVisible = reduceMotion || inView;

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: reduceMotion ? 0 : 0.8,
        delay: animateVisible ? delay : 0,
        ease,
      }}
    >
      {children}
    </motion.div>
  );
}
