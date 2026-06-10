function AlertMessage({ open, onClose, message, title = "Missing Information" }) {
  if (!open) return null;

  return (
    <div className="alert-overlay" onClick={onClose}>
      <div className="alert-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="alert-title">⚠️ {title}</h3>
        <p className="alert-message">{message}</p>
        <button className="alert-btn" onClick={onClose}>Got it</button>
      </div>
    </div>
  );
}

export default AlertMessage;