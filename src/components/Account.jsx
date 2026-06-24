import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout } from "../services/authService";

export default function Account({ user }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
  };

  return (
    <div className="account-wrapper">
      <button
        className="account-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        <User size={18} color="white" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="account-panel"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="account-header">
              <p className="account-email">{user?.email}</p>
            </div>

            <button className="account-logout-btn" onClick={handleLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}