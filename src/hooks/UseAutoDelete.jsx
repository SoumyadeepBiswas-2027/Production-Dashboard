// import { useRef } from "react";
// import { deleteTodo } from "../services/todoService";

// // How long after completion before a todo is auto-deleted (ms)
// const AUTO_DELETE_TIME = 60 * 1000; // 1 minute

// /* ================================
//    HOOK: useAutoDelete
//    Schedules automatic deletion of completed todos after a delay.
//    Returns { scheduleAutoDelete, cancelAutoDelete }.
// ================================ */
// export function useAutoDelete() {
//   const deleteTimers = useRef({});

//   /**
//    * Starts an auto-delete countdown for the given todoId.
//    * Safe to call multiple times — duplicate timers are ignored.
//    */
//   const scheduleAutoDelete = (todoId) => {
//     if (deleteTimers.current[todoId]) return; // already scheduled

//     deleteTimers.current[todoId] = setTimeout(async () => {
//       await deleteTodo(todoId);
//       delete deleteTimers.current[todoId];
//     }, AUTO_DELETE_TIME);
//   };

//   /**
//    * Cancels a pending auto-delete (e.g. when the todo is manually deleted).
//    */
//   const cancelAutoDelete = (todoId) => {
//     if (deleteTimers.current[todoId]) {
//       clearTimeout(deleteTimers.current[todoId]);
//       delete deleteTimers.current[todoId];
//     }
//   };

//   return { scheduleAutoDelete, cancelAutoDelete };
// }

import { useRef } from "react";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

// How long after completion before a todo is archived (ms)
const AUTO_DELETE_TIME = 60 * 1000; // 1 minute

export function useAutoDelete() {
  const deleteTimers = useRef({});

  const scheduleAutoDelete = (todoId) => {
    if (deleteTimers.current[todoId]) return;

    deleteTimers.current[todoId] = setTimeout(async () => {
      await updateDoc(doc(db, "todos", todoId), {
        archived: true,
        archivedAt: new Date().toISOString(),
      });

      delete deleteTimers.current[todoId];
    }, AUTO_DELETE_TIME);
  };

  const cancelAutoDelete = (todoId) => {
    if (deleteTimers.current[todoId]) {
      clearTimeout(deleteTimers.current[todoId]);
      delete deleteTimers.current[todoId];
    }
  };

  return {
    scheduleAutoDelete,
    cancelAutoDelete,
  };
}