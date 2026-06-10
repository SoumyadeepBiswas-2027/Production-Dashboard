let reminderInterval = null;
let reminderTimeout = null;

// Audio helper (ONLY once)
const alarmAudio = new Audio("/alarm.wav");
alarmAudio.loop = true;

export function startReminder({
  onTrigger,
  onStop
}) {
  const startTime = Date.now();

  // Fire every 30 seconds
  reminderInterval = setInterval(() => {
    onTrigger();           // 🔔 SHOW POPUP
    alarmAudio.play();     // 🔊 PLAY SOUND
  }, 30000);

  // Stop after 30 minutes
  reminderTimeout = setTimeout(() => {
    stopReminder();
    onStop();
  }, 30 * 60 * 1000);
}

export function stopReminder() {
  if (reminderInterval) clearInterval(reminderInterval);
  if (reminderTimeout) clearTimeout(reminderTimeout);

  alarmAudio.pause();
  alarmAudio.currentTime = 0;
}
