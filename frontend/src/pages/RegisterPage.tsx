import { useNavigate } from "react-router-dom"; 
import "../styles/RegisterPage.scss";
import logo from "../assets/logo.png";

export default function RegisterPage() {
    const navigate = useNavigate();
    const handleRegister = () => {
        navigate("/");
    };
  return (
    <div className="register-container">
      <div className="register-box">

        <img src={logo} alt="MOMent-logo" className="logo" />

        <input type="text" placeholder="Login" className="input" />
        <input type="password" placeholder="Password" className="input" />

        <button className="register-btn" onClick={handleRegister}>
            Register
        </button>

      </div>
    </div>
  );
}