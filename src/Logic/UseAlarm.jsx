import { useRef } from "react";

/* ================================
   HOOK: useAlarm
   Manages a looping alarm audio instance.
   Returns { playAlarm, stopAlarm }.
================================ */
export function useAlarm() {
  const activeAlarm = useRef(null);

  const playAlarm = () => {
    if (activeAlarm.current) return; // already playing

    const audio = new Audio("/alarm.wav");
    audio.loop = true;

    audio.play().catch((err) => {
      console.error("Alarm play failed", err);
    });

    activeAlarm.current = audio;
  };

  const stopAlarm = () => {
    if (activeAlarm.current) {
      activeAlarm.current.pause();
      activeAlarm.current.currentTime = 0;
      activeAlarm.current = null;
    }
  };

  return { playAlarm, stopAlarm };
}