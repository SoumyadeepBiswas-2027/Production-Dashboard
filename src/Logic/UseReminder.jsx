import { useState, useEffect, useRef } from "react";
import { isTodoDue } from "./TodoUtlls";

const MAX_REMINDER_DURATION = 30 * 60 * 1000; // 30 minutes
const REMINDER_INTERVAL = 30 * 1000;           // repeat every 30 seconds
const POLL_INTERVAL = 1000;                    // check every second

/* ================================
   HOOK: useReminder
   Polls todos every second, fires browser notifications and
   shows the in-app reminder popup when a todo becomes due.

   Returns:
     showReminder     – boolean, whether the popup should be visible
     activeTodoText   – text of the currently ringing todo
     activeTodoId     – id of the currently ringing todo
     stopReminder     – fn: closes popup and stops alarm
     clearReminderFor – fn(id): removes a todo from tracking entirely
================================ */
export function useReminder(todos, { playAlarm, stopAlarm }) {
  const [showReminder, setShowReminder] = useState(false);
  const [activeTodoText, setActiveTodoText] = useState("");
  const [activeTodoId, setActiveTodoId] = useState(null);

  // Tracks { startTime, lastNotified } per todo id
  const reminderTracker = useRef({});

  /* Request notification permission on mount */
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  /* Poll todos and fire reminders when due */
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      todos.forEach((todo) => {
        if (!isTodoDue(todo)) return;

        // Initialise tracker entry on first encounter
        if (!reminderTracker.current[todo.id]) {
          reminderTracker.current[todo.id] = {
            startTime: now,
            lastNotified: 0,
          };
        }

        const tracker = reminderTracker.current[todo.id];

        // Stop reminding after 30 minutes
        if (now - tracker.startTime > MAX_REMINDER_DURATION) return;

        // Fire at most once every 30 seconds
        if (now - tracker.lastNotified < REMINDER_INTERVAL) return;

        // Browser notification
        if (Notification.permission === "granted") {
          new Notification("Todo Reminder ⏰", { body: todo.text });
        }

        // In-app popup + alarm
        setActiveTodoText(todo.text);
        setActiveTodoId(todo.id);
        setShowReminder(true);
        playAlarm();

        tracker.lastNotified = now;
      });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [todos, playAlarm]);

  /** Close the popup and silence the alarm */
  const stopReminder = () => {
    setShowReminder(false);
    stopAlarm();
  };

  /** Remove a todo from the reminder tracker entirely */
  const clearReminderFor = (todoId) => {
    delete reminderTracker.current[todoId];
  };

  return {
    showReminder,
    activeTodoText,
    activeTodoId,
    setActiveTodoId,
    stopReminder,
    clearReminderFor,
  };
}