// import { useState, useEffect, useRef, useCallback } from "react";
// import { updateDoc, doc } from "firebase/firestore";
// import { db } from "../firebase";

// const POLL_INTERVAL = 1000;
// const AUTO_SNOOZE_AFTER = 60 * 1000; // 1 min of ringing → auto snooze
// const SNOOZE_DURATION = 30 * 1000; // 30s s
// const MAX_DURATION = 30 * 60 * 1000; // 30 min total window per task

// export function useReminder(todos, { playAlarm, stopAlarm }) {
//   const [showReminder, setShowReminder] = useState(false);
//   const [activeTodoText, setActiveTodoText] = useState("");
//   const [activeTodoId, setActiveTodoId] = useState(null);

//   // ✅ FIX: Use a ref to track active id inside async callbacks (avoids stale closure)
//   const activeTodoIdRef = useRef(null);
//   const autoSnoozeTimer = useRef(null);
//   const alarmActiveRef = useRef(false); // ✅ FIX: guard against re-triggering while popup is open

//   // Keep ref in sync with state
//   useEffect(() => {
//     activeTodoIdRef.current = activeTodoId;
//   }, [activeTodoId]);

//   // ─── Trigger popup + alarm for a todo ───────────────────────────────────────
//   const triggerReminder = useCallback(
//     (todo) => {
//       // ✅ FIX: Don't re-trigger if this same task is already ringing
//       if (alarmActiveRef.current && activeTodoIdRef.current === todo.id) return;

//       alarmActiveRef.current = true;
//       setActiveTodoText(todo.text);
//       setActiveTodoId(todo.id);
//       setShowReminder(true);
//       playAlarm();

//       // Clear any existing auto-snooze timer before setting a new one
//       if (autoSnoozeTimer.current) clearTimeout(autoSnoozeTimer.current);

//       // ✅ FIX: Read id from ref inside timeout so it's never stale
//       autoSnoozeTimer.current = setTimeout(async () => {
//         const currentId = activeTodoIdRef.current;
//         if (!currentId || currentId !== todo.id) return; // user already acted

//         const nextTime = new Date(Date.now() + SNOOZE_DURATION).toISOString();
//         await updateDoc(doc(db, "todos", todo.id), {
//           snoozedUntil: nextTime,
//         });

//         stopAlarm();
//         setShowReminder(false);
//         alarmActiveRef.current = false;
//         // Don't clear activeTodoId — poll will re-set it when snooze time hits
//       }, AUTO_SNOOZE_AFTER);
//     },
//     [playAlarm, stopAlarm],
//   );

//   // ─── Poll every second ───────────────────────────────────────────────────────
//   useEffect(() => {
//     const interval = setInterval(() => {
//       const now = Date.now();

//       todos.forEach(async (todo) => {
//         if (todo.completed || todo.dismissed || todo.missed) return;

//         const dueTime = todo.snoozedUntil
//           ? new Date(todo.snoozedUntil).getTime()
//           : new Date(todo.datetime).getTime();

//         if (now < dueTime) return;

//         // ─── Record first-trigger time ───
//         if (!todo.reminderStartedAt) {
//           await updateDoc(doc(db, "todos", todo.id), {
//             reminderStartedAt: new Date().toISOString(),
//           });
//           return; // wait for next tick so the updated doc is in todos
//         }

//         // ─── 30-min expiry ───
//         const elapsed = now - new Date(todo.reminderStartedAt).getTime();
//         if (elapsed > MAX_DURATION) {
//           await updateDoc(doc(db, "todos", todo.id), {
//             missed: true,
//             expiredAt: new Date().toISOString(),
//           });
//           if (activeTodoIdRef.current === todo.id) {
//             stopAlarm();
//             setShowReminder(false);
//             alarmActiveRef.current = false;
//             setActiveTodoId(null);
//           }
//           return;
//         }

//         // ─── Fire the popup ───
//         triggerReminder(todo);
//       });
//     }, POLL_INTERVAL);

//     return () => clearInterval(interval);
//   }, [todos, triggerReminder, stopAlarm]);

//   // ─── Called by any button press to immediately kill the alarm ───────────────
//   const stopReminder = useCallback(() => {
//     stopAlarm();
//     setShowReminder(false);
//     alarmActiveRef.current = false;

//     if (autoSnoozeTimer.current) {
//       clearTimeout(autoSnoozeTimer.current);
//       autoSnoozeTimer.current = null;
//     }
//   }, [stopAlarm]);

//   const clearReminderFor = useCallback((todoId) => {
//     if (activeTodoIdRef.current === todoId) {
//       setActiveTodoId(null);
//       activeTodoIdRef.current = null;
//     }
//   }, []);

//   return {
//     showReminder,
//     activeTodoText,
//     activeTodoId,
//     setActiveTodoId,
//     stopReminder,
//     clearReminderFor,
//   };
// }


import { useState, useEffect, useRef, useCallback } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const POLL_INTERVAL = 1000;
const AUTO_SNOOZE_AFTER = 60 * 1000;  // 1 min of ignoring popup → auto snooze
const SNOOZE_DURATION = 5 * 60 * 1000; // 5 min snooze lap (matches UseTodoActions)
//const SNOOZE_DURATION = 30 * 1000; // 30 seconds


export function useReminder(todos, { playAlarm, stopAlarm }) {
  const [showReminder, setShowReminder] = useState(false);
  const [activeTodoText, setActiveTodoText] = useState("");
  const [activeTodoId, setActiveTodoId] = useState(null);

  // Ref to track active id inside async callbacks — avoids stale closure
  const activeTodoIdRef = useRef(null);
  const autoSnoozeTimer = useRef(null);
  // Guard against re-triggering while popup is already open
  const alarmActiveRef = useRef(false);

  // Keep ref in sync with state
  useEffect(() => {
    activeTodoIdRef.current = activeTodoId;
  }, [activeTodoId]);

  // ─── Trigger popup + alarm for a todo ───────────────────────────────────────
  const triggerReminder = useCallback(
    (todo) => {
      // Don't re-trigger if this exact same task is already ringing
      if (alarmActiveRef.current && activeTodoIdRef.current === todo.id) return;

      alarmActiveRef.current = true;
      setActiveTodoText(todo.text);
      setActiveTodoId(todo.id);
      setShowReminder(true);
      playAlarm();

      // Clear any existing auto-snooze timer before setting a new one
      if (autoSnoozeTimer.current) clearTimeout(autoSnoozeTimer.current);

      // Auto-snooze fires if user ignores popup for 1 min
      // Must also increment snoozeCount and check overdue — same logic as manual snooze
      autoSnoozeTimer.current = setTimeout(async () => {
        const currentId = activeTodoIdRef.current;
        // If user already acted (done/snooze), bail out
        if (!currentId || currentId !== todo.id) return;

        // Increment snooze count
        const newSnoozeCount = (todo.snoozeCount || 0) + 1;

        // 3rd snooze hit via auto-snooze → mark overdue, stop everything
        if (newSnoozeCount >= 3) {
          await updateDoc(doc(db, "todos", todo.id), {
            overdue: true,
            overdueAt: new Date().toISOString(),
            snoozeCount: newSnoozeCount,
          });
          stopAlarm();
          setShowReminder(false);
          alarmActiveRef.current = false;
          setActiveTodoId(null);
          return;
        }

        // Under 3 snoozes — schedule next ring 5 mins from now
        const nextTime = new Date(Date.now() + SNOOZE_DURATION).toISOString();
        await updateDoc(doc(db, "todos", todo.id), {
          snoozedUntil: nextTime,
          snoozeCount: newSnoozeCount,
        });

        stopAlarm();
        setShowReminder(false);
        alarmActiveRef.current = false;
        // Don't clear activeTodoId — poll will re-set when snooze time hits
      }, AUTO_SNOOZE_AFTER);
    },
    [playAlarm, stopAlarm],
  );

  // ─── Poll every second ───────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      todos.forEach(async (todo) => {
        // Skip todos that are already done, dismissed or overdue — no more ringing
        if (todo.completed || todo.dismissed || todo.overdue) return;

        // Use snoozedUntil if set, otherwise use original datetime
        const dueTime = todo.snoozedUntil
          ? new Date(todo.snoozedUntil).getTime()
          : new Date(todo.datetime).getTime();

        // Not due yet — skip
        if (now < dueTime) return;

        // Record first-trigger time on first ring
        if (!todo.reminderStartedAt) {
          await updateDoc(doc(db, "todos", todo.id), {
            reminderStartedAt: new Date().toISOString(),
          });
          return; // wait for next tick so updated doc is in todos
        }

        // Fire the popup
        triggerReminder(todo);
      });
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [todos, triggerReminder, stopAlarm]);

  // ─── Called by any button press to immediately kill the alarm ───────────────
  const stopReminder = useCallback(() => {
    stopAlarm();
    setShowReminder(false);
    alarmActiveRef.current = false;

    // Cancel any pending auto-snooze timer
    if (autoSnoozeTimer.current) {
      clearTimeout(autoSnoozeTimer.current);
      autoSnoozeTimer.current = null;
    }
  }, [stopAlarm]);

  // Remove a todo from reminder tracking entirely
  const clearReminderFor = useCallback((todoId) => {
    if (activeTodoIdRef.current === todoId) {
      setActiveTodoId(null);
      activeTodoIdRef.current = null;
    }
  }, []);

  return {
    showReminder,
    activeTodoText,
    activeTodoId,
    setActiveTodoId,
    stopReminder,
    clearReminderFor,
  };
}