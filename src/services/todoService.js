import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";

const todoCollection = collection(db, "todos");

export const subscribeToTodos = (callback) => {
  return onSnapshot(todoCollection, (snapshot) => {
    const todosFromFirebase = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      .filter(
        (todo) =>
          !todo.dismissed &&
          // We removed the !todo.missed check here so they stay visible
          !todo.archived,
      );

    callback(todosFromFirebase);
  });
};

export const addTodo = async ({ text, datetime }) => {
  if (!text) return;

  const newTodo = {
    text,
    datetime: datetime || new Date().toISOString(),
    completed: false,
    dismissed: false,
    missed: false,
    archived: false,
    overdue: false,
    overdueAt: null,

    snoozeCount: 0, // <-- Start counting snoozes at zero

    completedAt: null,
    dismissedAt: null,
    expiredAt: null,
    archivedAt: null,
    snoozedUntil: null,
    reminderStartedAt: null,
    rescheduled: false, 
    notificationDismissed: false,
  };

  await addDoc(todoCollection, newTodo);
};

export const deleteTodo = async (id) => {
  await deleteDoc(doc(db, "todos", id));
};

export const toggleTodo = async (id, completed) => {
  await updateDoc(doc(db, "todos", id), {
    completed: !completed,
  });
};

export const dismissTodo = async (id) => {
  await updateDoc(doc(db, "todos", id), {
    dismissed: true,
    dismissedAt: new Date().toISOString(),
  });
};
