// import { useState, useEffect } from "react";
// import { subscribeToTodos } from "../services/todoService";

// /* ================================
//    HOOK: useTodos
//    Subscribes to Firestore and returns live todos list.
// ================================ */
// export function useTodos() {
//   const [todos, setTodos] = useState([]);

//   useEffect(() => {
//     const unsubscribe = subscribeToTodos(setTodos);
//     return () => unsubscribe();
//   }, []);

//   return todos;
// }

import { useState, useEffect } from "react";
import { subscribeToTodos } from "../services/todoService";

export function useTodos(userId) {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToTodos(userId, setTodos);
    return () => unsubscribe();
  }, [userId]);

  return todos;
}