import { addTodo, deleteTodo, toggleTodo } from "../services/todoService";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

const SNOOZE_DURATION = 5 * 60 * 1000; // 5 mins     <=====revert back=======>
// const SNOOZE_DURATION = 5 * 1000; // 5 mins

export function UseTodoActions({
  activeTodoId,
  setActiveTodoId,
  stopReminder,
  clearReminderFor,
  scheduleAutoDelete,
  cancelAutoDelete,
}) {
  
  // const handleAddTodo = async ({ text, datetime }) => {
  //   await addTodo({ text, datetime });
  // };
  const handleAddTodo = async ({ text, datetime, userId }) => {
    await addTodo({ text, datetime, userId });
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

  // ✅ DONE — marks complete, closes popup, schedules auto-delete
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

  // ❌ DISMISS — marks dismissed, saved to DB, popup closes
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

  // // 💤 SNOOZE — closes popup, re-triggers after 30s from NOW
  // const handleSnooze = async (todoId) => {
  //   if (!todoId) return;

  //   const nextTime = new Date(Date.now() + SNOOZE_DURATION).toISOString();

  //   await updateDoc(doc(db, "todos", todoId), {
  //     snoozedUntil: nextTime,
  //   });

  //   // ✅ stopReminder cancels the auto-snooze timer too, so we don't double-snooze
  //   stopReminder();
  //   setActiveTodoId(null);
  // };


  const handleSnooze = async (todoId, currentSnoozeCount) => {
  if (!todoId) return;

  const newSnoozeCount = (currentSnoozeCount || 0) + 1;

  if (newSnoozeCount >= 3) {
    await updateDoc(doc(db, "todos", todoId), {
      overdue: true,
      overdueAt: new Date().toISOString(),
      snoozeCount: newSnoozeCount,
    });
    stopReminder();
    setActiveTodoId(null);
    return;
  }

  const nextTime = new Date(Date.now() + SNOOZE_DURATION).toISOString();
  await updateDoc(doc(db, "todos", todoId), {
    snoozedUntil: nextTime,
    snoozeCount: newSnoozeCount,
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