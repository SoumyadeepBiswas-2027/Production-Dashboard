import { AiOutlineCheck } from "react-icons/ai";

export function Complete({ completed, onToggle }) {
  return (
    <button className="Complete-Btn" onClick={onToggle} style={{ backgroundColor: completed ? "green" : "" }}>
      {completed ? "Completed!" : <AiOutlineCheck />}
    </button>
  );
}
