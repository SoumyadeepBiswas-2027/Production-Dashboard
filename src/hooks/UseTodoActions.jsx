// import { addTodo, deleteTodo, toggleTodo } from "../services/todoService";
// import { updateDoc, doc } from "firebase/firestore";
// import { db } from "../firebase";

// const SNOOZE_DURATION = 30 * 1000; // 30 seconds

// export function UseTodoActions({
//   activeTodoId,
//   setActiveTodoId,
//   stopReminder,
//   clearReminderFor,
//   scheduleAutoDelete,
//   cancelAutoDelete,
// }) {
//   const handleAddTodo = async ({ text, datetime }) => {
//     await addTodo({ text, datetime });
//   };

//   const handleDeleteTodo = async (todo) => {
//     await deleteTodo(todo.id);
//     clearReminderFor(todo.id);
//     cancelAutoDelete(todo.id);
//   };

//   const handleToggleCompleted = async (todo) => {
//     await toggleTodo(todo.id, todo.completed);
//     clearReminderFor(todo.id);
//     stopReminder();

//     if (!todo.completed) {
//       scheduleAutoDelete(todo.id);
//     }
//   };

//   // ✅ DONE — marks complete, closes popup, schedules auto-delete
//   const handleDone = async () => {
//     if (!activeTodoId) return;

//     await updateDoc(doc(db, "todos", activeTodoId), {
//       completed: true,
//       completedAt: new Date().toISOString(),
//       snoozedUntil: null,
//     });

//     stopReminder();
//     clearReminderFor(activeTodoId);
//     scheduleAutoDelete(activeTodoId);
//     setActiveTodoId(null);
//   };

//   // ❌ DISMISS — marks dismissed, saved to DB, popup closes
//   const handleDismissTodo = async (todo) => {
//     await updateDoc(doc(db, "todos", todo.id), {
//       dismissed: true,
//       dismissedAt: new Date().toISOString(),
//       snoozedUntil: null,
//     });

//     stopReminder();
//     clearReminderFor(todo.id);
//     cancelAutoDelete(todo.id);
//     setActiveTodoId(null);
//   };

//   // 💤 SNOOZE — closes popup, re-triggers after 30s from NOW
//   const handleSnooze = async (todoId) => {
//     if (!todoId) return;

//     const nextTime = new Date(Date.now() + SNOOZE_DURATION).toISOString();

//     await updateDoc(doc(db, "todos", todoId), {
//       snoozedUntil: nextTime,
//     });

//     // ✅ stopReminder cancels the auto-snooze timer too, so we don't double-snooze
//     stopReminder();
//     setActiveTodoId(null);
//   };

//   return {
//     handleAddTodo,
//     handleDeleteTodo,
//     handleToggleCompleted,
//     handleDone,
//     handleDismissTodo,
//     handleSnooze,
//   };
// }


//have to be resolved as ,before code and after code is same (******please check******)


import {
  addTodo,
  deleteTodo,
  toggleTodo,
} from "../services/todoService";

import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const SNOOZE_DURATION = 30 * 1000;

export function UseTodoActions({
  activeTodoId,
  setActiveTodoId,
  stopReminder,
  clearReminderFor,
  scheduleAutoDelete,
  cancelAutoDelete,
}) {
  const handleAddTodo = async ({ text, datetime }) => {
    await addTodo({ text, datetime });
  };

  const handleDeleteTodo = async (todo) => {
    await deleteTodo(todo.id);

    clearReminderFor(todo.id);
    cancelAutoDelete(todo.id);
  };

  const handleToggleCompleted = async (todo) => {
    await toggleTodo(todo.id, todo.completed);

    clearReminderFor(todo.id);
    stopReminder();

    if (!todo.completed) {
      scheduleAutoDelete(todo.id);
    }
  };

  // ✔️ DONE
  const handleDone = async () => {
    if (!activeTodoId) return;

    await updateDoc(doc(db, "todos", activeTodoId), {
      completed: true,
      completedAt: new Date().toISOString(),
      snoozedUntil: null,
    });

    stopReminder();

    clearReminderFor(activeTodoId);

    scheduleAutoDelete(activeTodoId);

    setActiveTodoId(null);
  };

  // ❌ DISMISS
  const handleDismissTodo = async (todo) => {
    await updateDoc(doc(db, "todos", todo.id), {
      dismissed: true,
      dismissedAt: new Date().toISOString(),
      snoozedUntil: null,
    });

    stopReminder();

    clearReminderFor(todo.id);

    cancelAutoDelete(todo.id);

    setActiveTodoId(null);
  };

  // 💤 SNOOZE
  const handleSnooze = async (todoId) => {
    if (!todoId) return;

    const nextTime = new Date(
      Date.now() + SNOOZE_DURATION
    ).toISOString();

    await updateDoc(doc(db, "todos", todoId), {
      snoozedUntil: nextTime,
    });

    stopReminder();

    setActiveTodoId(null);
  };

  return {
    handleAddTodo,
    handleDeleteTodo,
    handleToggleCompleted,
    handleDone,
    handleDismissTodo,
    handleSnooze,
  };
}