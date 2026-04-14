import { useState } from "react";
import { loginUser, signupUser } from "../api";
import userIcon from "../assets/auth-user.png";
import emailIcon from "../assets/auth-email.png";
import passwordIcon from "../assets/auth-password.png";
import "./LoginSignup.css";

function LoginSignup({ onAuthSuccess }) {
  const [mode, setMode] = useState("signup");
  const [form, setForm] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isSignup = mode === "signup";

  const setField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const username = form.username.trim().toLowerCase();
    const password = form.password;
    const name = form.name.trim();

    if (!username) {
      setError("Username is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (isSignup && !name) {
      setError("Name is required for sign up.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = isSignup
        ? await signupUser({
            username,
            password,
            name,
          })
        : await loginUser({
            username,
            password,
          });

      if (typeof onAuthSuccess === "function") {
        onAuthSuccess(response.user);
      }
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="auth-shell" aria-live="polite">
      <div className="auth-template-card">
        <div className="auth-template-header">
          <p className="auth-template-kicker">SmartPrep AI</p>
          <h2>{isSignup ? "Sign Up" : "Login"}</h2>
          <span className="auth-template-underline" />
        </div>

        <form className="auth-template-form" onSubmit={handleSubmit}>
          {isSignup ? (
            <label className="auth-template-input">
              <img src={userIcon} alt="" aria-hidden="true" />
              <input
                type="text"
                placeholder="Full Name"
                value={form.name}
                onChange={(event) => setField("name", event.target.value)}
                autoComplete="name"
                required
              />
            </label>
          ) : null}

          <label className="auth-template-input">
            <img src={emailIcon} alt="" aria-hidden="true" />
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(event) => setField("username", event.target.value)}
              autoComplete="username"
              required
            />
          </label>

          <label className="auth-template-input">
            <img src={passwordIcon} alt="" aria-hidden="true" />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              autoComplete={isSignup ? "new-password" : "current-password"}
              required
            />
          </label>

          {error ? <p className="error-banner">{error}</p> : null}

          <button type="submit" className="auth-template-submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isSignup ? "Create Account" : "Login"}
          </button>
        </form>

        <div className="auth-template-switch-row">
          <button
            type="button"
            className={`auth-template-switch ${isSignup ? "active" : ""}`}
            onClick={() => switchMode("signup")}
            disabled={isSubmitting}
          >
            Sign Up
          </button>
          <button
            type="button"
            className={`auth-template-switch ${!isSignup ? "active" : ""}`}
            onClick={() => switchMode("login")}
            disabled={isSubmitting}
          >
            Login
          </button>
        </div>
      </div>
    </section>
  );
}

export default LoginSignup;
