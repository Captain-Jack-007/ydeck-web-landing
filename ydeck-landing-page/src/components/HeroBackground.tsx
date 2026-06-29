import { motion, type MotionValue } from 'framer-motion';

export function HeroBackground({ gridY }: { gridY: MotionValue<number> }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ydeck-black">
      <motion.div
        className="blueprint-grid absolute inset-0 opacity-45"
        style={{ y: gridY }}
      />
      <div className="radial-glow absolute inset-0 opacity-70" />
      <div className="noise-overlay absolute inset-0 opacity-25" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(3,5,10,0.34),rgba(3,5,10,0.86)_72%,#03050A)]" />
    </div>
  );
}
