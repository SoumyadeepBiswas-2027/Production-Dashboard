import { useState } from "react";
import { signUpWithEmail, loginWithEmail, loginWithGoogle } from "../services/authService";

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false); // toggle between login/signup
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Email/Password form submit ────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // No need to redirect manually — useAuth hook detects login automatically
    } catch (err) {
      // Firebase gives readable error codes like "auth/wrong-password"
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  // ─── Google login ────────────────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-box">
        <h1 className="auth-title">
          {isSignUp ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="auth-subtitle">
          {isSignUp
            ? "Sign up to start organizing your day"
            : "Log in to continue"}
        </p>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
            minLength={6}
          />

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Log In"}
          </button>
        </form>

        {/* Divider */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* Google Button */}
        <button onClick={handleGoogleLogin} className="auth-google-btn" disabled={loading}>
          Continue with Google
        </button>

        {/* Toggle Login/Signup */}
        <p className="auth-toggle">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <span onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? "Log In" : "Sign Up"}
          </span>
        </p>
      </div>
    </div>
  );
}