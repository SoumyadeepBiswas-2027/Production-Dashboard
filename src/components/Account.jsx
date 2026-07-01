// import { useState } from "react";
// import { LogOut, User } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { logout } from "../services/authService";

// export default function Account({ user }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleLogout = async () => {
//     await logout();
//     setIsOpen(false);
//   };

//   return (
//     <div className="account-wrapper">
//       <button
//         className="account-btn"
//         onClick={() => setIsOpen(!isOpen)}
//       >
//         <User size={18} color="white" />
//       </button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             className="account-panel"
//             initial={{ opacity: 0, y: 10, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.95 }}
//             transition={{ duration: 0.2 }}
//           >
//             <div className="account-header">
//               <p className="account-email">{user?.email}</p>
//             </div>

//             <button className="account-logout-btn" onClick={handleLogout}>
//               <LogOut size={16} />
//               Logout
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }



////////////////////////////2nd part

// import { useState } from "react";
// import { LogOut, User, RefreshCw } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { logout, loginWithGoogle } from "../services/authService";

// export default function Account({ user }) {
//   const [isOpen, setIsOpen] = useState(false);

//   const handleLogout = async () => {
//     await logout();
//     setIsOpen(false);
//   };

//   // Switch account — logs out current user, immediately opens Google picker
//   // so user can pick a different account
//   const handleSwitchAccount = async () => {
//     await logout();
//     setIsOpen(false);
//     await loginWithGoogle();
//   };

//   // Get first letter of email for the avatar circle
//   const avatarLetter = user?.email?.charAt(0).toUpperCase() || "?";

//   return (
//     <div className="account-wrapper">
//       <button className="account-btn" onClick={() => setIsOpen(!isOpen)}>
//         {/* If Google login, show real photo. Otherwise show initial letter */}
//         {user?.photoURL ? (
//           <img src={user.photoURL} alt="profile" className="account-avatar-img" />
//         ) : (
//           <div className="account-avatar-circle">{avatarLetter}</div>
//         )}
//       </button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             className="account-panel"
//             initial={{ opacity: 0, y: 10, scale: 0.95 }}
//             animate={{ opacity: 1, y: 0, scale: 1 }}
//             exit={{ opacity: 0, y: 10, scale: 0.95 }}
//             transition={{ duration: 0.2 }}
//           >
//             {/* Profile section */}
//             <div className="account-header">
//               {user?.photoURL ? (
//                 <img src={user.photoURL} alt="profile" className="account-avatar-img-large" />
//               ) : (
//                 <div className="account-avatar-circle-large">{avatarLetter}</div>
//               )}
//               <div>
//                 <p className="account-name">{user?.displayName || "User"}</p>
//                 <p className="account-email">{user?.email}</p>
//               </div>
//             </div>

//             {/* Actions */}
//             <button className="account-action-btn" onClick={handleSwitchAccount}>
//               <RefreshCw size={16} />
//               Switch Account
//             </button>

//             <button className="account-logout-btn" onClick={handleLogout}>
//               <LogOut size={16} />
//               Logout
//             </button>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }


///////3rd part

import { LogOut, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { logout, loginWithGoogle } from "../services/authService";

export default function Account({ user, isOpen, onToggle }) {
  // isOpen and onToggle now come from App.jsx — controls which dropdown is open globally

  const handleLogout = async () => {
    await logout();
    onToggle(); // closes dropdown via parent state
  };

  const handleSwitchAccount = async () => {
    await logout();
    onToggle(); // closes dropdown via parent state
    await loginWithGoogle();
  };

  const avatarLetter = user?.email?.charAt(0).toUpperCase() || "?";

  return (
    <div className="account-wrapper">
      <button className="account-btn" onClick={onToggle}>
        {user?.photoURL ? (
          <img src={user.photoURL} alt="profile" className="account-avatar-img" />
        ) : (
          <div className="account-avatar-circle">{avatarLetter}</div>
        )}
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
              {user?.photoURL ? (
                <img src={user.photoURL} alt="profile" className="account-avatar-img-large" />
              ) : (
                <div className="account-avatar-circle-large">{avatarLetter}</div>
              )}
              <div>
                <p className="account-name">{user?.displayName || "User"}</p>
                <p className="account-email">{user?.email}</p>
              </div>
            </div>

            <button className="account-action-btn" onClick={handleSwitchAccount}>
              <RefreshCw size={16} />
              Switch Account
            </button>

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