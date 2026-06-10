/* ================================
   TODO UTILITY FUNCTIONS
================================ */

/**
 * Returns true if a todo has a datetime set, is not completed,
 * and that datetime has already passed (i.e. the todo is due).
 */
export function isTodoDue(todo) {
  if (!todo.datetime || todo.completed) return false;
  return new Date() >= new Date(todo.datetime);
}