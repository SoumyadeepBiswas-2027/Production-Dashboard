import { AiFillEdit } from "react-icons/ai";
import { useState } from "react";
import AlertMessage from "./AlertMessage"; // ← default import now

function AddTodo({ handleonChange }) {
  const [inputValue, setInputValue] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const handleAddButtonClicked = () => {
    if (!inputValue.trim() && !dateTime) {
      setAlertMessage(
        "Please enter both ur task and specific date and time before adding.",
      );
      setAlertOpen(true);
      return;
    }
    if (!inputValue.trim()) {
      setAlertMessage("Please enter your specific task before adding.");
      setAlertOpen(true);
      return;
    }
    if (!dateTime) {
      setAlertMessage(
        "Please select a specific date and time,for your task!",
      );
      setAlertOpen(true);
      return;
    }

    handleonChange({ text: inputValue, datetime: dateTime });
    setInputValue("");
    setDateTime("");
  };

  return (
    <div className="inputContainer">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="What's in your mind..."
        className="input"
      />
      <input
        type="datetime-local"
        value={dateTime}
        onChange={(e) => setDateTime(e.target.value)}
        className="input-DateTime"
      />
      <button
        className="input-btn"
        type="button"
        onClick={handleAddButtonClicked}
      >
        <AiFillEdit />
      </button>

      <AlertMessage
        open={alertOpen}
        onClose={() => setAlertOpen(false)}
        message={alertMessage}
      />
    </div>
  );
}

export default AddTodo;
