"use client";

import { useEffect, useState } from "react";

export function useCountdown(targetIso: string | null | undefined) {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (!targetIso) {
      setRemaining(0);
      return;
    }
    const update = () => {
      const target = new Date(targetIso).getTime();
      if (Number.isNaN(target)) {
        setRemaining(0);
        return;
      }
      setRemaining(Math.max(0, Math.ceil((target - Date.now()) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [targetIso]);

  return remaining;
}
