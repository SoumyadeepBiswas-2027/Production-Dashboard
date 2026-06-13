import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import IntroText from "./BitsStore/IntroText";
import HeroStyle from "./BitsStore/Aurora";
import TodoItems from "./components/TodoItems";
import AddTodo from "./components/AddTodo";
import EmptyText from "./BitsStore/EmptyText";
import ReminderPopup from "./components/ReminderPopup";
import Navbar from "./components/Navbar";

import { useTodos } from "./hooks/UseTodos";
import { useAlarm } from "./hooks/UseAlarm";
import { useAutoDelete } from "./hooks/UseAutoDelete";
import { useReminder } from "./hooks/UseReminder";
import { UseTodoActions } from "./hooks/UseTodoActions";

function App() {
  const todos = useTodos();
  const { playAlarm, stopAlarm } = useAlarm();
  const { scheduleAutoDelete, cancelAutoDelete } = useAutoDelete();
  const {
    showReminder,
    activeTodoText,
    activeTodoId,
    setActiveTodoId,
    stopReminder,
    clearReminderFor,
  } = useReminder(todos, { playAlarm, stopAlarm });

  const {
    handleAddTodo,
    handleDeleteTodo,
    handleToggleCompleted,
    handleDone,
    handleDismissTodo,
    handleSnooze, // ✅ FIX: was destructured but never imported before
  } = UseTodoActions({
    activeTodoId,
    setActiveTodoId,
    stopReminder,
    clearReminderFor,
    scheduleAutoDelete,
    cancelAutoDelete,
  });

  return (
    <>
      <HeroStyle className="aurora-container pointer-events-none" />
      <Navbar />
      <IntroText className="introText" />
      <AddTodo handleonChange={handleAddTodo} />

      {todos.length === 0 ? (
        <div style={{ marginTop: "20px", marginLeft: "20px" }}>
          <EmptyText hoverIntensity={0.5} />
        </div>
      ) : (
        <TodoItems
          value={todos}
          onDelete={handleDeleteTodo}
          onToggle={handleToggleCompleted}
        />
      )}

      {/* {showReminder && (
        <ReminderPopup
          text={activeTodoText}
          onSnooze={() => handleSnooze(activeTodoId)} // ✅ FIX: was calling handleSnooze as onDone
          onDone={handleDone} // ✅ FIX: was wired to onTerminate by mistake
          onDismiss={() => handleDismissTodo({ id: activeTodoId })}
        />
      )} */}
      {showReminder && (
        <ReminderPopup
          text={activeTodoText}
          // CHANGED:
          // onSnooze={() => handleSnooze(activeTodoId)}
          onSnooze={() => handleSnooze(activeTodoId, todos.find(t => t.id === activeTodoId)?.snoozeCount)}
          // CHANGED:
          onDone={handleDone}
        />
      )}
    </>
  );
}

export default App;
