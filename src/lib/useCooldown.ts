import { useCallback, useEffect, useRef, useState } from "react";

/** Small resend cooldown timer. */
export function useCooldown() {
  const [seconds, setSeconds] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const start = useCallback((from = 30) => {
    setSeconds(from);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1 && timer.current) clearInterval(timer.current);
        return s <= 1 ? 0 : s - 1;
      });
    }, 1000);
  }, []);

  return { seconds, start };
}
