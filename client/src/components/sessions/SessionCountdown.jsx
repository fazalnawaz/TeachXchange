import { useEffect, useState } from "react";

export default function SessionCountdown({ targetDate }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) {
        setRemaining("Starting now");
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      if (days > 0) {
        setRemaining(`${days}d ${hours}h ${mins}m`);
      } else {
        setRemaining(`${hours}h ${mins}m ${secs}s`);
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <span className="text-sm font-mono font-semibold text-purple-600 dark:text-purple-400">
      {remaining}
    </span>
  );
}
