// // src/services/todoService.js
// import {
//   collection,
//   addDoc,
//   deleteDoc,
//   doc,
//   updateDoc,
//   onSnapshot,
// } from "firebase/firestore";
// import { db } from "../firebase";

// const todoCollection = collection(db, "todos");

// // 🔹 Real-time listener
// export const subscribeToTodos = (callback) => {
//   return onSnapshot(todoCollection, (snapshot) => {
//     const todosFromFirebase = snapshot.docs
//       .map((doc) => ({
//         id: doc.id,
//         ...doc.data(),
//       }))
//       // ✅ FIX: also hide missed tasks from the live list
//       .filter((todo) => !todo.dismissed && !todo.missed);

//     callback(todosFromFirebase);
//   });
// };

// // 🔹 Add todo
// export const addTodo = async ({ text, datetime }) => {
//   if (!text) return;

//   const newTodo = {
//     text,
//     datetime: datetime || new Date().toISOString(),
//     completed: false,
//     dismissed: false,
//     missed: false,

//     completedAt: null,
//     dismissedAt: null,
//     expiredAt: null,
//     snoozedUntil: null,
//     reminderStartedAt: null,
//   };

//   await addDoc(todoCollection, newTodo);
// };

// // 🔹 Delete todo
// export const deleteTodo = async (id) => {
//   await deleteDoc(doc(db, "todos", id));
// };

// // 🔹 Toggle completed (used in list view)
// export const toggleTodo = async (id, completed) => {
//   await updateDoc(doc(db, "todos", id), {
//     completed: !completed,
//   });
// };

// // 🔹 Dismiss
// export const dismissTodo = async (id) => {
//   await updateDoc(doc(db, "todos", id), {
//     dismissed: true,
//     dismissedAt: new Date().toISOString(),
//   });
// };

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

// 🔹 Real-time listener
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
          !todo.missed &&
          !todo.archived
      );

    callback(todosFromFirebase);
  });
};

// 🔹 Add todo
export const addTodo = async ({ text, datetime }) => {
  if (!text) return;

  const newTodo = {
    text,
    datetime: datetime || new Date().toISOString(),

    completed: false,
    dismissed: false,
    missed: false,
    archived: false,

    completedAt: null,
    dismissedAt: null,
    expiredAt: null,
    archivedAt: null,

    snoozedUntil: null,
    reminderStartedAt: null,
  };

  await addDoc(todoCollection, newTodo);
};

// 🔹 Delete todo (manual delete only)
export const deleteTodo = async (id) => {
  await deleteDoc(doc(db, "todos", id));
};

// 🔹 Toggle completed
export const toggleTodo = async (id, completed) => {
  await updateDoc(doc(db, "todos", id), {
    completed: !completed,
  });
};

// 🔹 Dismiss
export const dismissTodo = async (id) => {
  await updateDoc(doc(db, "todos", id), {
    dismissed: true,
    dismissedAt: new Date().toISOString(),
  });
};