import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../App.jsx";

const Navbar = () => {
  const { user, setUser } = React.useContext(AuthContext);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const goSection = (id) => {
    navigate("/");
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  return (
    <header className="nav">
      <div className="brand">
        <span className="logo-dot" />
        CraveCraft
      </div>
      <nav>
        <button className="nav-link" onClick={() => goSection("menu")}>
          Menu
        </button>
        <button className="nav-link" onClick={() => goSection("combos")}>
          Combos
        </button>
        <button className="nav-link" onClick={() => goSection("custom-builder")}>
          Customize
        </button>
        {user && <Link to="/orders">My Orders</Link>}
        <Link to="/group">Group Order</Link>
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
      </nav>
      <div className="nav-actions">
        {user ? (
          <>
            <span className="badge">{user.name}</span>
            <button className="btn ghost" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link className="btn ghost" to="/login">
              Login
            </Link>
            <Link className="btn" to="/register">
              Sign up
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

export default Navbar;
