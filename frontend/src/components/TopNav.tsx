import { useLocation, useNavigate } from "react-router-dom";
import "../styles/TopNav.scss";
import { useAuth } from "../contexts/AuthContext";

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();

  const hideNavRoutes = ["/login", "/register"];
  if (hideNavRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <header className="top-nav">
      <img
        src="/MOMent.png"
        className="logo"
        onClick={() => navigate("/")}
        alt="Logo"
      />

      <div className="top-nav-buttons">
        <button className="nav-btn" onClick={() => navigate("/map")}>
          Map
        </button>
        <button className="nav-btn" onClick={() => navigate("/nannies")}>
          Nannies
        </button>
        {!isLoading && (
          <img
            src="/user.jpg"
            className="user"
            onClick={() => (user ? navigate("/profile") : navigate("/login"))}
            alt="User"
          />
        )}
      </div>
    </header>
  );
}
