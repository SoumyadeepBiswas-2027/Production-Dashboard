import { useState, useEffect } from "react";
import { subscribeToTodos } from "../services/todoService";

/* ================================
   HOOK: useTodos
   Subscribes to Firestore and returns live todos list.
================================ */
export function useTodos() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToTodos(setTodos);
    return () => unsubscribe();
  }, []);

  return todos;
}