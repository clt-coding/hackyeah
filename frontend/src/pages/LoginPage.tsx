import { useNavigate } from "react-router-dom"; 
import "../styles/LoginPage.scss";
import logo from "../assets/logo.png";

export default function LoginPage() {
    const navigate = useNavigate();
    const handleLogin = () => {
        navigate("/");
    };
    const handleRegister = () => {
        navigate("/register");
    }
  return (
    <div className="login-container">
      <div className="login-box">

        <img src={logo} alt="MOMent-logo" className="logo" />

        <input type="text" placeholder="Login" className="input" />
        <input type="password" placeholder="Password" className="input" />

        <button className="login-btn" onClick={handleLogin}>
            Log in
        </button>

        <button className="register-btn" onClick={handleRegister}>
          Don't have an account? Register
        </button>

      </div>
    </div>
  );
}