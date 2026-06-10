import { AiFillDelete } from "react-icons/ai";

function TodoItems({ value, onDelete, onToggle }) {
  return (
    <div className="listContainer">
      <ul className="list-group">
        {value.map((item) => (
          <div
            key={item.id}
            style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <li
              className="list-group-item"
              style={{
                textDecoration: item.completed ? "line-through" : "none",
                opacity: item.completed ? 0.6 : 1,
              }}
            >
              <span className="item-text">{item.text}</span>
              <br />
              <span className="item-datetime-local">
                Due: {new Date(item.datetime).toLocaleString()}
              </span>
            </li>

            <button className="Delete-Btn" onClick={() => onDelete(item)}>
              <AiFillDelete />
            </button>

            <button
              className="Complete-Btn"
              onClick={() => onToggle(item)}
              style={{
                marginLeft: "10px",
                backgroundColor: item.completed ? "green" : "",
                color: item.completed ? "white" : "",
              }}
            >
              {item.completed ? "Completed!" : "Mark Done"}
            </button>
          </div>
        ))}
      </ul>
    </div>
  );
}
export default TodoItems;
