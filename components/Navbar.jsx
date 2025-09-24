import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import "../styles.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const goDashboard = () => {
    if (user?.role === "student") navigate("/dashboard/student");
    else if (user?.role === "mentor") navigate("/dashboard/mentor");
    else if (user?.role === "admin") navigate("/dashboard/admin");
  };

  const handlePracticeClick = () => {
    if (user) {
      navigate("/my-tests");
    } else {
      navigate("/signup");
    }
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <img src="/OEMS.png" alt="logo" />
        <h2>SMART TEST CENTER</h2>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <button onClick={handlePracticeClick} className="nav-link-button">Practice</button>
          <Link to="/aboutus">About Us</Link>
          <Link to="/contactus">Contact Us</Link>
        </div>
      </div>
      <div className="auth-links">
        {user ? (
          <>
            <span
              onClick={goDashboard}
              style={{ cursor: "pointer", fontWeight: "bold" }}
              title="Go to Dashboard"
            >
              {user.name}
            </span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
}