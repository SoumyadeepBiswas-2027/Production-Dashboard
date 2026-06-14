import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

export default function Notification() {
  const [isOpen, setIsOpen] = useState(false);
  const [overdueTasks, setOverdueTasks] = useState([]);

  // ─── Real-time listener for archived overdue tasks ────────────────────────
  // Using onSnapshot instead of getDocs — so bell updates automatically
  // the moment midnight timer archives tasks, no polling needed
  useEffect(() => {
    const q = query(
      collection(db, "todos"),
      where("overdue", "==", true),
      where("archived", "==", true),
      where("rescheduled", "==", false),
      where("notificationDismissed", "==", false)
    );

    // Fires immediately and on every change in Firestore
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOverdueTasks(tasks);
    });

    // Cleanup listener when component unmounts
    return () => unsubscribe();
  }, []);

  // ─── YES — Reschedule all overdue tasks ───────────────────────────────────
  const handleReschedule = async () => {
    const now = new Date();

    const reschedulePromises = overdueTasks.map(async (task) => {
      const originalDate = new Date(task.datetime);
      const newDate = new Date();

      // Same hour and minute as original task
      newDate.setHours(originalDate.getHours());
      newDate.setMinutes(originalDate.getMinutes());
      newDate.setSeconds(0);

      // If that time today already passed → push to tomorrow
      if (newDate <= now) {
        newDate.setDate(newDate.getDate() + 1);
      }

      // Create fresh todo with same text but new datetime
      // All fields reset — completely fresh start
      await addDoc(collection(db, "todos"), {
        text: task.text,
        datetime: newDate.toISOString(),
        completed: false,
        dismissed: false,
        missed: false,
        archived: false,
        overdue: false,
        overdueAt: null,
        rescheduled: false,
        notificationDismissed: false,
        snoozeCount: 0,
        completedAt: null,
        dismissedAt: null,
        expiredAt: null,
        archivedAt: null,
        snoozedUntil: null,
        reminderStartedAt: null,
      });

      // Mark original as rescheduled — stays in DB for history
      await updateDoc(doc(db, "todos", task.id), {
        rescheduled: true,
      });
    });

    await Promise.all(reschedulePromises);
    setOverdueTasks([]);
    setIsOpen(false);
  };

  // ─── NO — Dismiss all overdue notifications ───────────────────────────────
  const handleDismiss = async () => {
    const dismissPromises = overdueTasks.map((task) =>
      updateDoc(doc(db, "todos", task.id), {
        notificationDismissed: true,
      })
    );

    await Promise.all(dismissPromises);
    setOverdueTasks([]);
    setIsOpen(false);
  };

  return (
    <div className="notification-wrapper">

      {/* Bell Button */}
      <button
        className="notification-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={18} color="white" />

        {/* Red badge — only shows when overdue tasks exist */}
        {overdueTasks.length > 0 && (
          <div className="notification-badge">
            {overdueTasks.length}
          </div>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>

        {/* Has overdue tasks */}
        {isOpen && overdueTasks.length > 0 && (
          <motion.div
            className="notification-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notification-header">
              <h3>🔔 Pending Tasks</h3>
            </div>

            <div className="notification-body">
              <p className="notification-message">
                You have{" "}
                <span>
                  {overdueTasks.length} task
                  {overdueTasks.length > 1 ? "s" : ""}
                </span>{" "}
                that were not completed yesterday. Would you like
                to reschedule them for today at the same time?
              </p>

              <div className="notification-actions">
                <button
                  className="notification-yes-btn"
                  onClick={handleReschedule}
                >
                  ✅ Yes, Reschedule
                </button>
                <button
                  className="notification-no-btn"
                  onClick={handleDismiss}
                >
                  ❌ No, Dismiss
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* No overdue tasks — all clear */}
        {isOpen && overdueTasks.length === 0 && (
          <motion.div
            className="notification-empty"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <p>🎉 All caught up! No pending tasks.</p>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}


////////////////////////////for test below/////////////////////////////


// import { useState, useEffect } from "react";
// import { Bell } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   addDoc,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../firebase";

// export default function Notification() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [overdueTasks, setOverdueTasks] = useState([]);

//   // ─── Fetch archived overdue tasks — runs on mount + every 15 seconds ─────────
//   // Needed because archiving happens async (midnight timer)
//   // so we need to keep checking for newly archived tasks
//   useEffect(() => {
//     const fetchOverdueTasks = async () => {
//       const q = query(
//         collection(db, "todos"),
//         where("overdue", "==", true),
//         where("archived", "==", true),
//         where("rescheduled", "==", false),
//         where("notificationDismissed", "==", false)
//       );
//       const snapshot = await getDocs(q);
//       const tasks = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
//       setOverdueTasks(tasks);
//     };

//     // Run immediately on mount
//     fetchOverdueTasks();

//     // Then re-check every 15 seconds to catch newly archived tasks
//     const interval = setInterval(fetchOverdueTasks, 15 * 1000);

//     return () => clearInterval(interval);
//   }, []);

//   // ─── YES — Reschedule all overdue tasks ───────────────────────────────────────
//   const handleReschedule = async () => {
//     const now = new Date();

//     const reschedulePromises = overdueTasks.map(async (task) => {
//       const originalDate = new Date(task.datetime);
//       const newDate = new Date();

//       // Same hour and minute as original task
//       newDate.setHours(originalDate.getHours());
//       newDate.setMinutes(originalDate.getMinutes());
//       newDate.setSeconds(0);

//       // If that time today already passed → push to tomorrow
//       if (newDate <= now) {
//         newDate.setDate(newDate.getDate() + 1);
//       }

//       // Create fresh todo with same text but new datetime
//       // All fields reset — completely fresh start
//       await addDoc(collection(db, "todos"), {
//         text: task.text,
//         datetime: newDate.toISOString(),
//         completed: false,
//         dismissed: false,
//         missed: false,
//         archived: false,
//         overdue: false,
//         overdueAt: null,
//         rescheduled: false,
//         notificationDismissed: false,
//         snoozeCount: 0,
//         completedAt: null,
//         dismissedAt: null,
//         expiredAt: null,
//         archivedAt: null,
//         snoozedUntil: null,
//         reminderStartedAt: null,
//       });

//       // Mark original archived task as rescheduled
//       // Keeps it in DB for history but removes from notification
//       await updateDoc(doc(db, "todos", task.id), {
//         rescheduled: true,
//       });
//     });

//     // Reschedule all at once
//     await Promise.all(reschedulePromises);

//     setOverdueTasks([]);
//     setIsOpen(false);
//   };

//   // ─── NO — Dismiss all overdue notifications ───────────────────────────────────
//   const handleDismiss = async () => {
//     const dismissPromises = overdueTasks.map((task) =>
//       updateDoc(doc(db, "todos", task.id), {
//         notificationDismissed: true,
//       })
//     );

//     // Dismiss all at once
//     await Promise.all(dismissPromises);

//     setOverdueTasks([]);
//     setIsOpen(false);
//   };

//   return (
//     <div className="notification-wrapper">

//       {/* Bell Button */}
//       <button
//         className="notification-btn"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <Bell size={18} color="white" />

//         {/* Red badge — only shows when overdue tasks exist */}
//         {overdueTasks.length > 0 && (
//           <div className="notification-badge">
//             {overdueTasks.length}
//           </div>
//         )}
//       </button>

//       {/* Dropdown */}
//       <AnimatePresence>

//         {/* Has overdue tasks */}
//         {isOpen && overdueTasks.length > 0 && (
//           <motion.div
//             className="notification-panel"
//             initial={{ opacity: 0, y: 10, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.95 }}
//             transition={{ duration: 0.2 }}
//           >
//             {/* Header */}
//             <div className="notification-header">
//               <h3>🔔 Pending Tasks</h3>
//             </div>

//             {/* Body */}
//             <div className="notification-body">
//               <p className="notification-message">
//                 You have{" "}
//                 <span>
//                   {overdueTasks.length} task
//                   {overdueTasks.length > 1 ? "s" : ""}
//                 </span>{" "}
//                 that were not completed yesterday. Would you like
//                 to reschedule them for today at the same time?
//               </p>

//               {/* Yes / No Buttons */}
//               <div className="notification-actions">
//                 <button
//                   className="notification-yes-btn"
//                   onClick={handleReschedule}
//                 >
//                   ✅ Yes, Reschedule
//                 </button>
//                 <button
//                   className="notification-no-btn"
//                   onClick={handleDismiss}
//                 >
//                   ❌ No, Dismiss
//                 </button>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* No overdue tasks — all clear */}
//         {isOpen && overdueTasks.length === 0 && (
//           <motion.div
//             className="notification-empty"
//             initial={{ opacity: 0, y: 10, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.95 }}
//             transition={{ duration: 0.2 }}
//           >
//             <p>🎉 All caught up! No pending tasks.</p>
//           </motion.div>
//         )}

//       </AnimatePresence>
//     </div>
//   );
// }