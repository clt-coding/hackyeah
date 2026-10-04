import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import "../styles/LoginPage.scss";
import logo from "../assets/logo.png";

const loginSchema = yup
  .object({
    email: yup
      .string()
      .email("Please enter a valid email address")
      .required("Email is required"),
    password: yup.string().required("Password is required"),
  })
  .required();

type LoginFormData = yup.InferType<typeof loginSchema>;

export default function LoginPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    setServerError(null);

    let res: Response;
    try {
      res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      setServerError("Could not reach the server. Is it running?");
      return;
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error ?? "Login failed");
      return;
    }

    console.log("login ok");
    navigate("/");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <img src={logo} alt="MOMent-logo" className="logo" />

        <form onSubmit={handleSubmit(handleLogin)} className="login-form">
          <div className="input-field">
            <input
              type="email"
              placeholder="E-mail"
              className="input"
              {...register("email")}
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="input-field">
            <input
              type="password"
              placeholder="Password"
              className="input"
              {...register("password")}
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          {serverError && <p className="error-text">{serverError}</p>}

          <button type="submit" className="login-btn" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>

        <button
          type="button"
          className="register-link-btn"
          onClick={handleRegister}
        >
          Don't have an account? Register
        </button>
      </div>
    </div>
  );
}
