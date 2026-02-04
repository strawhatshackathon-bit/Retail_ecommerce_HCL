import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../lib/api.js";
import { AuthContext } from "../App.jsx";

const Register = () => {
  const navigate = useNavigate();
  const { setUser } = React.useContext(AuthContext);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const data = await auth.register(form);
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
      <h2>Create Account</h2>
      <form onSubmit={submit} className="card form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
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
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button className="btn" type="submit">
          Register
        </button>
        {error && <p className="muted">{error}</p>}
      </form>
    </section>
  );
};

export default Register;
