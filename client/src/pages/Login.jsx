import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./auth.css";

import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      // store token in auth context
      login(response.data.token);

      setMessage(response.data.message);

      // redirect after login
      navigate("/dashboard");
    } catch (err) {
      setMessage(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <p className="login-card__eyebrow">Project Management App</p>
          <h2>Login</h2>
          <p className="login-card__subtitle">
            Sign in to continue to your team workspace.
          </p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form__field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="login-form__input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="login-form__field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="login-form__input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="login-form__button" type="submit">
            Login
          </button>
        </form>

        <p className="login-card__footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>

        {message ? <p className="login-card__message">{message}</p> : null}
      </div>
    </div>
  );
}
