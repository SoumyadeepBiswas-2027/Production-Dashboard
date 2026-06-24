import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fires whenever login state changes (login, logout, page refresh)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // null if logged out, user object if logged in
      setLoading(false);    // done checking — safe to render app now
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}