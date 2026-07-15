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

// import { useState, useEffect } from "react";

// import { useTodos } from "./hooks/UseTodos";
// import { useAlarm } from "./hooks/UseAlarm";
// import { useAutoDelete } from "./hooks/UseAutoDelete";
// import { useReminder } from "./hooks/UseReminder";
// import { UseTodoActions } from "./hooks/UseTodoActions";
// import { useMidnight } from "./hooks/useMidnight";

// import { useAuth } from "./hooks/useAuth";
// import AuthPage from "./components/AuthPage";
// import Account from "./components/Account";
// import OnboardingQuiz from "./components/OnboardingQuiz";



// function App() {
//   // --- 1. POPUP DETECTION ---
//   // Are we running inside the tiny floating window? Let's check the URL.
//   const searchParams = new URLSearchParams(window.location.search);
//   const isPopup = searchParams.get("popup") === "true";
//   const popupText = searchParams.get("text") || "Reminder!";


  
//   useEffect(() => {
//     if (isPopup) {
//       document.documentElement.classList.add("popup-mode"); // targets <html>
//       document.body.classList.add("popup-mode"); // targets <body>
//       document.getElementById("root")?.classList.add("popup-mode");
//     } else {
//       document.documentElement.classList.remove("popup-mode");
//       document.body.classList.remove("popup-mode");
//       document.getElementById("root")?.classList.remove("popup-mode");
//     }
//   }, [isPopup]);

//   const [activeDropdown, setActiveDropdown] = useState(null);

//   const { user, loading } = useAuth();
//   const todos = useTodos(user?.uid);

//     // --- NEW: Quiz State ---
//   // Check local storage so we only show this once per device for now
//   const [showQuiz, setShowQuiz] = useState(() => {
//     return !localStorage.getItem("adhdSetupComplete");
//   });

//   // If we are in the floating popup, prevent hooks from double-firing the alarm logic
//   const popupSafeTodos = isPopup ? [] : todos;

//   const { playAlarm, stopAlarm } = useAlarm();
//   const { scheduleAutoDelete, cancelAutoDelete } = useAutoDelete();
//   const {
//     showReminder,
//     activeTodoText,
//     activeTodoId,
//     setActiveTodoId,
//     stopReminder,
//     clearReminderFor,
//   } = useReminder(popupSafeTodos, { playAlarm, stopAlarm });

//   useMidnight(popupSafeTodos);

//   const {
//     handleAddTodo,
//     handleDeleteTodo,
//     handleToggleCompleted,
//     handleDone,
//     handleSnooze,
//   } = UseTodoActions({
//     activeTodoId,
//     setActiveTodoId,
//     stopReminder,
//     clearReminderFor,
//     scheduleAutoDelete,
//     cancelAutoDelete,
//   });

//   // --- 2. REMOTE CONTROL EFFECT ---
//   // The Smart Dashboard listens for the signals sent by the Floating Popup
//   useEffect(() => {
//     if (!isPopup && window.electronAPI) {
//       // When the floating popup clicks "Done", execute the real handleDone!
//       window.electronAPI.onTriggerDone(() => {
//         handleDone();
//       });

//       // When the floating popup clicks "Snooze", execute the real handleSnooze!
//       window.electronAPI.onTriggerSnooze(() => {
//         const currentSnoozeCount = todos.find(
//           (t) => t.id === activeTodoId,
//         )?.snoozeCount;
//         handleSnooze(activeTodoId, currentSnoozeCount);
//       });
//     }
//   }, [isPopup, handleDone, handleSnooze, activeTodoId, todos]);

//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (!e.target.closest(".top-right-icons")) {
//         setActiveDropdown(null);
//       }
//     };
//     document.addEventListener("click", handleClickOutside);
//     return () => document.removeEventListener("click", handleClickOutside);
//   }, []);

//   // --- 3. RENDER THE FLOATING POPUP ONLY ---
//   // If we are in the tiny window, bypass everything and ONLY draw the card!

//   if (isPopup) {
//     return (
//       <div
//         style={{
//           width: "100vw",
//           height: "100vh",
//           display: "flex" /* Center using flexbox */,
//           justifyContent: "center",
//           alignItems: "center",
//           overflow: "hidden" /* THIS KILLS THE SCROLLBARS */,
//           background: "transparent",
//         }}
//       >
//         <ReminderPopup
//           text={popupText}
//           onDone={() => window.electronAPI?.sendActionDone()}
//           onSnooze={() => window.electronAPI?.sendActionSnooze()}
//         />
//       </div>
//     );
//   }

//   // --- 4. RENDER THE NORMAL DASHBOARD ---
//   if (loading) {
//     return (
//       <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
//         Loading...
//       </div>
//     );
//   }

//   if (!user) {
//     return <AuthPage />;
//   }

//    // --- 5. RENDER THE ONBOARDING QUIZ (After Auth, Before Dashboard) ---
//   if (showQuiz) {
//     return (
//       <OnboardingQuiz 
//         onComplete={(needsSupport) => {
//           // Mark quiz as completed in browser memory
//           localStorage.setItem("adhdSetupComplete", "true");
          
//           // Store the AI's decision (true/false) locally for now
//           localStorage.setItem("needsAdhdSupport", needsSupport);
          
//           // Hide the quiz and show the dashboard!
//           setShowQuiz(false);
//         }} 
//       />
//     );
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

//       {/* We only show the in-app popup if electronAPI is missing 
//         (e.g., if you are testing directly in Chrome instead of Electron) 
//       */}
//       {showReminder && !window.electronAPI && (
//         <ReminderPopup
//           text={activeTodoText}
//           onSnooze={() =>
//             handleSnooze(
//               activeTodoId,
//               todos.find((t) => t.id === activeTodoId)?.snoozeCount,
//             )
//           }
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

import { useState, useEffect } from "react";

import { useTodos } from "./hooks/UseTodos";
import { useAlarm } from "./hooks/UseAlarm";
import { useAutoDelete } from "./hooks/UseAutoDelete";
import { useReminder } from "./hooks/UseReminder";
import { UseTodoActions } from "./hooks/UseTodoActions";
import { useMidnight } from "./hooks/useMidnight";

import { useAuth } from "./hooks/useAuth";
import AuthPage from "./components/AuthPage";
import Account from "./components/Account";
import OnboardingQuiz from "./components/OnboardingQuiz";



function App() {
  // --- 1. POPUP DETECTION ---
  // Are we running inside the tiny floating window? Let's check the URL.
  const searchParams = new URLSearchParams(window.location.search);
  const isPopup = searchParams.get("popup") === "true";
  const popupText = searchParams.get("text") || "Reminder!";


  
  useEffect(() => {
    if (isPopup) {
      document.documentElement.classList.add("popup-mode"); // targets <html>
      document.body.classList.add("popup-mode"); // targets <body>
      document.getElementById("root")?.classList.add("popup-mode");
    } else {
      document.documentElement.classList.remove("popup-mode");
      document.body.classList.remove("popup-mode");
      document.getElementById("root")?.classList.remove("popup-mode");
    }
  }, [isPopup]);

  const [activeDropdown, setActiveDropdown] = useState(null);

  const { user, loading } = useAuth();
  const todos = useTodos(user?.uid);

    // --- NEW: Quiz State ---
  // Check local storage so we only show this once per device for now
  const [showQuiz, setShowQuiz] = useState(() => {
    return !localStorage.getItem("adhdSetupComplete");
  });

  // --- NEW: Focus Mode State ---
  // Holds "standard" | "inattentive" | "combined" — the result of the quiz.
  // Loaded once on startup from localStorage so returning users keep their mode
  // without retaking the quiz. Any component can read `focusMode` from here later.
  const [focusMode, setFocusMode] = useState(() => {
    return localStorage.getItem("focusMode") || "standard";
  });

  // If we are in the floating popup, prevent hooks from double-firing the alarm logic
  const popupSafeTodos = isPopup ? [] : todos;

  const { playAlarm, stopAlarm } = useAlarm();
  const { scheduleAutoDelete, cancelAutoDelete } = useAutoDelete();
  const {
    showReminder,
    activeTodoText,
    activeTodoId,
    setActiveTodoId,
    stopReminder,
    clearReminderFor,
  } = useReminder(popupSafeTodos, { playAlarm, stopAlarm });

  useMidnight(popupSafeTodos);

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

  // --- 2. REMOTE CONTROL EFFECT ---
  // The Smart Dashboard listens for the signals sent by the Floating Popup
  useEffect(() => {
    if (!isPopup && window.electronAPI) {
      // When the floating popup clicks "Done", execute the real handleDone!
      window.electronAPI.onTriggerDone(() => {
        handleDone();
      });

      // When the floating popup clicks "Snooze", execute the real handleSnooze!
      window.electronAPI.onTriggerSnooze(() => {
        const currentSnoozeCount = todos.find(
          (t) => t.id === activeTodoId,
        )?.snoozeCount;
        handleSnooze(activeTodoId, currentSnoozeCount);
      });
    }
  }, [isPopup, handleDone, handleSnooze, activeTodoId, todos]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".top-right-icons")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // --- 3. RENDER THE FLOATING POPUP ONLY ---
  // If we are in the tiny window, bypass everything and ONLY draw the card!

  if (isPopup) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex" /* Center using flexbox */,
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden" /* THIS KILLS THE SCROLLBARS */,
          background: "transparent",
        }}
      >
        <ReminderPopup
          text={popupText}
          onDone={() => window.electronAPI?.sendActionDone()}
          onSnooze={() => window.electronAPI?.sendActionSnooze()}
        />
      </div>
    );
  }

  // --- 4. RENDER THE NORMAL DASHBOARD ---
  if (loading) {
    return (
      <div style={{ color: "white", textAlign: "center", marginTop: "100px" }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

   // --- 5. RENDER THE ONBOARDING QUIZ (After Auth, Before Dashboard) ---
  if (showQuiz) {
    return (
      <OnboardingQuiz 
        onComplete={(mode) => {
          // Mark quiz as completed in browser memory
          localStorage.setItem("adhdSetupComplete", "true");

          // Store the AI's decision — "standard" | "inattentive" | "combined"
          localStorage.setItem("focusMode", mode);
          setFocusMode(mode);

          // Hide the quiz and show the dashboard!
          setShowQuiz(false);
        }} 
      />
    );
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

      {/* We only show the in-app popup if electronAPI is missing 
        (e.g., if you are testing directly in Chrome instead of Electron) 
      */}
      {showReminder && !window.electronAPI && (
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