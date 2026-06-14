import { useEffect, useRef } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

export function useMidnight(todos) {
  const midnightTimerRef = useRef(null);

  // ─── Archive all overdue tasks from previous day ──────────────────────────────
  const archiveOverdueTasks = async () => {
    const now = new Date();

    const q = query(
      collection(db, "todos"),
      where("overdue", "==", true),
      where("completed", "==", false),
      where("archived", "==", false)
    );

    const snapshot = await getDocs(q);
    const archivePromises = [];

    snapshot.forEach((todoDoc) => {
      const data = todoDoc.data();
      const overdueDate = new Date(data.overdueAt);

      // Only archive if overdueAt is from a PREVIOUS day
      // Prevents tasks that just became overdue at 12:01am
      // from being wrongly archived immediately
      const isFromPreviousDay =
        overdueDate.toDateString() !== now.toDateString();

      if (isFromPreviousDay) {
        archivePromises.push(
          updateDoc(doc(db, "todos", todoDoc.id), {
            archived: true,
            archivedAt: new Date().toISOString(),
          })
        );
      }
    });

    await Promise.all(archivePromises);
    midnightTimerRef.current = null;
    console.log(`${archivePromises.length} overdue tasks archived at midnight`);
  };

  // ─── Schedule ONE timer until midnight ───────────────────────────────────────
  const scheduleMidnightTimer = () => {
    if (midnightTimerRef.current) return;

    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0); // next midnight exactly

    const msUntilMidnight = midnight - now; // real midnight

    midnightTimerRef.current = setTimeout(() => {
      archiveOverdueTasks();
    }, msUntilMidnight);

    console.log(
      `Midnight timer set — fires in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`
    );
  };

  // ─── Startup check — runs ONCE when app opens ────────────────────────────────
  // Handles case where app was closed before midnight
  // and timer never fired
  useEffect(() => {
    const startupCheck = async () => {
      const now = new Date();

      const q = query(
        collection(db, "todos"),
        where("overdue", "==", true),
        where("completed", "==", false),
        where("archived", "==", false)
      );

      const snapshot = await getDocs(q);
      const archivePromises = [];

      snapshot.forEach((todoDoc) => {
        const data = todoDoc.data();
        const overdueDate = new Date(data.overdueAt);

        // Only archive tasks from a PREVIOUS day
        const isFromPreviousDay =
          overdueDate.toDateString() !== now.toDateString();

        if (isFromPreviousDay) {
          archivePromises.push(
            updateDoc(doc(db, "todos", todoDoc.id), {
              archived: true,
              archivedAt: new Date().toISOString(),
            })
          );
        }
      });

      if (archivePromises.length > 0) {
        await Promise.all(archivePromises);
        console.log(
          `Startup: ${archivePromises.length} stale overdue tasks archived`
        );
      }
    };

    // Runs once immediately when app opens
    startupCheck();

    return () => {
      if (midnightTimerRef.current) {
        clearTimeout(midnightTimerRef.current);
      }
    };
  }, []);

  // ─── Watch todos — start timer when first overdue task appears ───────────────
  useEffect(() => {
    const hasOverdue = todos.some(
      (todo) => todo.overdue && !todo.completed && !todo.archived
    );

    if (hasOverdue) {
      scheduleMidnightTimer();
    }
  }, [todos]);
}



///////////////////////////////////////testing code/////////////////////////////////////////////////////

// import { useEffect, useRef } from "react";
// import {
//   collection,
//   query,
//   where,
//   getDocs,
//   updateDoc,
//   doc,
// } from "firebase/firestore";
// import { db } from "../firebase";

// export function useMidnight(todos) {
//   const midnightTimerRef = useRef(null);

//   // ─── Archive all overdue tasks ───────────────────────────────────────────────
//   const archiveOverdueTasks = async () => {
//     const q = query(
//       collection(db, "todos"),
//       where("overdue", "==", true),
//       where("completed", "==", false),
//       where("archived", "==", false)
//     );

//     const snapshot = await getDocs(q);
//     const archivePromises = [];

//     snapshot.forEach((todoDoc) => {
//       // NO day check for testing — archives everything overdue immediately
//       archivePromises.push(
//         updateDoc(doc(db, "todos", todoDoc.id), {
//           archived: true,
//           archivedAt: new Date().toISOString(),
//         })
//       );
//     });

//     await Promise.all(archivePromises);
//     midnightTimerRef.current = null;
//     console.log(`${archivePromises.length} overdue tasks archived`);
//   };

//   // ─── Schedule ONE timer ───────────────────────────────────────────────────────
//   const scheduleMidnightTimer = () => {
//     if (midnightTimerRef.current) return; // already running

//     // 10 seconds for testing — revert to (midnight - now) for production
//     const msUntilMidnight = 10 * 1000;

//     midnightTimerRef.current = setTimeout(() => {
//       archiveOverdueTasks();
//     }, msUntilMidnight);

//     console.log("Midnight timer set — fires in 10 seconds");
//   };

//   // ─── Watch todos — start timer when overdue task appears ─────────────────────
//   useEffect(() => {
//     const hasOverdue = todos.some(
//       (todo) => todo.overdue && !todo.completed && !todo.archived
//     );

//     if (hasOverdue) {
//       scheduleMidnightTimer();
//     }
//   }, [todos]);

//   // ─── Cleanup on unmount ───────────────────────────────────────────────────────
//   useEffect(() => {
//     return () => {
//       if (midnightTimerRef.current) {
//         clearTimeout(midnightTimerRef.current);
//       }
//     };
//   }, []);
// }