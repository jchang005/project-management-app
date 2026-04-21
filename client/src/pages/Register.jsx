import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import "./auth.css";
import api from "../api/axios";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/register", {
        email,
        username,
        password,
      });

      setMessage(response.data.message);

      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__header">
          <p className="login-card__eyebrow">Project Management App</p>
          <h2>Create Account</h2>
          <p className="login-card__subtitle">
            Set up your account to start managing your team tasks.
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
            <label htmlFor="username">Username</label>
            <input
              id="username"
              className="login-form__input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
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
            Register
          </button>
        </form>

        <p className="login-card__footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>

        {message ? <p className="login-card__message">{message}</p> : null}
      </div>
    </div>
  );
}
