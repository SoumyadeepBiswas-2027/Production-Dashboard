// import "./App.css";
// import "bootstrap/dist/css/bootstrap.min.css";

// import IntroText from "./BitsStore/IntroText";
// import HeroStyle from "./BitsStore/Aurora";
// import TodoItems from "./components/TodoItems";
// import AddTodo from "./components/AddTodo";
// import EmptyText from "./BitsStore/EmptyText";
// import ReminderPopup from "./components/ReminderPopup";
// import Hamberg from "./components/Hamberg";
// import Notification from "./components/Notification";

// import { useState } from "react";
// import { useTodos } from "./hooks/UseTodos";
// import { useAlarm } from "./hooks/UseAlarm";
// import { useAutoDelete } from "./hooks/UseAutoDelete";
// import { useReminder } from "./hooks/UseReminder";
// import { UseTodoActions } from "./hooks/UseTodoActions";
// import { useMidnight } from "./hooks/useMidnight";

// //Below is authentication imports
// import { useAuth } from "./hooks/useAuth";
// import AuthPage from "./components/AuthPage";
// import Account from "./components/Account";

// function App() {
//   const [activeDropdown, setActiveDropdown] = useState(null); // dropdown state
//   const { user, loading } = useAuth();
//   // const todos = useTodos();
//   const todos = useTodos(user?.uid);
//   const { playAlarm, stopAlarm } = useAlarm();
//   const { scheduleAutoDelete, cancelAutoDelete } = useAutoDelete();
//   const {
//     showReminder,
//     activeTodoText,
//     activeTodoId,
//     setActiveTodoId,
//     stopReminder,
//     clearReminderFor,
//   } = useReminder(todos, { playAlarm, stopAlarm });

//   useMidnight(todos); //midnight logic

//   const {
//     handleAddTodo,
//     handleDeleteTodo,
//     handleToggleCompleted,
//     handleDone,
//     // handleDismissTodo,
//     handleSnooze, // ✅ FIX: was destructured but never imported before
//   } = UseTodoActions({
//     activeTodoId,
//     setActiveTodoId,
//     stopReminder,
//     clearReminderFor,
//     scheduleAutoDelete,
//     cancelAutoDelete,
//   });

//   //Authentication logic
//   // Still checking if user is logged in — show nothing yet
//   if (loading) {
//     return (
//       <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
//         Loading...
//       </div>
//     );
//   }

//   // Not logged in — show login/signup screen only
//   if (!user) {
//     return <AuthPage />;
//   }

//   return (
//     <>
//       <HeroStyle className="aurora-container pointer-events-none" />
//       <Hamberg />

//       <div className="top-right-icons">
//         <Notification
//           isOpen={activeDropdown === "notification"}
//           onToggle={() =>
//             setActiveDropdown(
//               activeDropdown === "notification" ? null : "notification",
//             )
//           }
//         />
//         <Account
//           user={user}
//           isOpen={activeDropdown === "account"}
//           onToggle={() =>
//             setActiveDropdown(activeDropdown === "account" ? null : "account")
//           }
//         />
//       </div>

//       <IntroText className="introText" />

//       {/* <AddTodo handleonChange={handleAddTodo} /> */}
//       {/* changes made due to Authentication  implimentation on Addtodo*/}
//       <AddTodo
//         handleonChange={(data) => handleAddTodo({ ...data, userId: user.uid })}
//       />

//       {todos.length === 0 ? (
//         <div style={{ marginTop: "20px", marginLeft: "20px" }}>
//           <EmptyText hoverIntensity={0.5} />
//         </div>
//       ) : (
//         <TodoItems
//           value={todos}
//           onDelete={handleDeleteTodo}
//           onToggle={handleToggleCompleted}
//         />
//       )}

//       {/* {showReminder && (
//         <ReminderPopup
//           text={activeTodoText}
//           onSnooze={() => handleSnooze(activeTodoId)} // ✅ FIX: was calling handleSnooze as onDone
//           onDone={handleDone} // ✅ FIX: was wired to onTerminate by mistake
//           onDismiss={() => handleDismissTodo({ id: activeTodoId })}
//         />
//       )} */}
//       {showReminder && (
//         <ReminderPopup
//           text={activeTodoText}
//           // CHANGED:
//           // onSnooze={() => handleSnooze(activeTodoId)}
//           onSnooze={() =>
//             handleSnooze(
//               activeTodoId,
//               todos.find((t) => t.id === activeTodoId)?.snoozeCount,
//             )
//           }
//           // CHANGED:
//           onDone={handleDone}
//         />
//       )}
//     </>
//   );
// }

// export default App;


import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

import IntroText from "./BitsStore/IntroText";
import HeroStyle from "./BitsStore/Aurora";
import TodoItems from "./components/TodoItems";
import AddTodo from "./components/AddTodo";
import EmptyText from "./BitsStore/EmptyText";
import ReminderPopup from "./components/ReminderPopup";
import Hamberg from "./components/Hamberg";
import Notification from "./components/Notification";

import { useState, useEffect } from "react"; // ← useEffect added for click-outside logic

import { useTodos } from "./hooks/UseTodos";
import { useAlarm } from "./hooks/UseAlarm";
import { useAutoDelete } from "./hooks/UseAutoDelete";
import { useReminder } from "./hooks/UseReminder";
import { UseTodoActions } from "./hooks/UseTodoActions";
import { useMidnight } from "./hooks/useMidnight";

// Authentication imports
import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import Account from "./components/Account";

function App() {
  // Tracks which dropdown is currently open: "notification" | "account" | null
  // Shared state so only ONE dropdown can be open at a time
  const [activeDropdown, setActiveDropdown] = useState(null);

  const { user, loading } = useAuth();
  const todos = useTodos(user?.uid);
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

  useMidnight(todos); // midnight archive logic

  const {
    handleAddTodo,
    handleDeleteTodo,
    handleToggleCompleted,
    handleDone,
    handleSnooze,
  } = UseTodoActions({
    activeTodoId,
    setActiveTodoId,
    stopReminder,
    clearReminderFor,
    scheduleAutoDelete,
    cancelAutoDelete,
  });

  // ─── Click outside closes any open dropdown ─────────────────────────────────
  // Checks if the click target is OUTSIDE the .top-right-icons wrapper
  // (which contains both Notification bell and Account icon)
  // If outside → close whatever dropdown is open
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".top-right-icons")) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ─── Auth gating ──────────────────────────────────────────────────────────────
  // Still checking if user is logged in — show nothing yet
  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        Loading...
      </div>
    );
  }

  // Not logged in — show login/signup screen only
  if (!user) {
    return <AuthPage />;
  }

  return (
    <>
      <HeroStyle className="aurora-container pointer-events-none" />
      <Hamberg />

      <div className="top-right-icons">
        <Notification
          isOpen={activeDropdown === "notification"}
          onToggle={() =>
            setActiveDropdown(
              activeDropdown === "notification" ? null : "notification",
            )
          }
        />
        <Account
          user={user}
          isOpen={activeDropdown === "account"}
          onToggle={() =>
            setActiveDropdown(activeDropdown === "account" ? null : "account")
          }
        />
      </div>

      <IntroText className="introText" />

      {/* userId attached so todo is tied to the logged-in user */}
      <AddTodo
        handleonChange={(data) => handleAddTodo({ ...data, userId: user.uid })}
      />

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

      {showReminder && (
        <ReminderPopup
          text={activeTodoText}
          onSnooze={() =>
            handleSnooze(
              activeTodoId,
              todos.find((t) => t.id === activeTodoId)?.snoozeCount,
            )
          }
          onDone={handleDone}
        />
      )}
    </>
  );
}

export default App;