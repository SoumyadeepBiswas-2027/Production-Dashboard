// import "./ReminderPopup.css";

// export default function ReminderPopup({ text, onDone, onTerminate, onDismiss }) {
//   return (
//     <div className="reminder-popup">
//       <h3>⏰ Reminder</h3>
//       <p>{text}</p>

//       <div className="popup-actions">
//         <button onClick={onDone}>🔁Snooze!</button>
//         <button onClick={onTerminate}>✔️Done</button>
//         <button onClick={onDismiss}>❌</button>
//       </div>
//     </div>
//   );
// }

import "./ReminderPopup.css";

export default function ReminderPopup({
  text,
  onSnooze,
  onDone,
}) {
  return (
    <div className="reminder-popup">
      <h3>⏰ Reminder</h3>
      <p>{text}</p>

      <div className="popup-actions">
        {/* CHANGED: Snooze now uses onSnooze */}
        <button onClick={onSnooze}>
          🔁 Snooze
        </button>

        {/* CHANGED: Done now directly uses onDone */}
        <button onClick={onDone}>
          ✔️ Done
        </button>
      </div>
    </div>
  );
}