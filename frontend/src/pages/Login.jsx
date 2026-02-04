import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/api.js";
import { AuthContext } from "../App.jsx";

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = React.useContext(AuthContext);
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await auth.login(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <section className="auth">
      <h2>Login</h2>
      <form onSubmit={submit} className="card form">
        <input
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          placeholder="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn" type="submit">
          Login
        </button>
        {error && <p className="muted">{error}</p>}
      </form>
    </section>
  );
};

export default Login;
