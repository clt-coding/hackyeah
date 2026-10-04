import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useAuth } from "../contexts/AuthContext";
import "../styles/RegisterPage.scss";
import logo from "../assets/logo.png";

const accountTypes = ["parent", "nanny"] as const;
const weekdays = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const registerSchema = yup.object({
  role: yup
    .mixed<(typeof accountTypes)[number]>()
    .oneOf(accountTypes, "Please choose an account type")
    .required("Please choose an account type"),
  email: yup
    .string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must have at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must be identical")
    .required("Confirm Password is required"),
  address: yup
    .object({
      street: yup.string(),
      houseNumber: yup.string(),
      apartament: yup.string(),
      city: yup.string(),
      postalCode: yup.string(),
    })
    .when("role", {
      is: "parent",
      then: (schema) =>
        schema.shape({
          street: yup.string().required("Street is required"),
          houseNumber: yup.string().required("House number is required"),
          city: yup.string().required("City is required"),
          postalCode: yup
            .string()
            .matches(/^\d{2}-\d{3}$/, "Code in format XX-XXX")
            .required("Postal code is required"),
        }),
      otherwise: (schema) => schema.strip(),
    }),
  nanny: yup
    .object({
      phone_number: yup.string(),
      hourly_wage: yup.number().transform((value, originalValue) =>
        originalValue === "" ? undefined : value,
      ),
      availability: yup.array().of(yup.boolean().required()),
    })
    .when("role", {
      is: "nanny",
      then: (schema) =>
        schema.shape({
          phone_number: yup
            .string()
            .trim()
            .required("Phone number is required"),
          hourly_wage: yup
            .number()
            .transform((value, originalValue) =>
              originalValue === "" ? undefined : value,
            )
            .typeError("Hourly rate must be a number")
            .min(0, "Hourly rate cannot be negative")
            .required("Hourly rate is required"),
          availability: yup
            .array()
            .of(yup.boolean().required())
            .length(weekdays.length, "Select availability for each day")
            .required(),
        }),
      otherwise: (schema) => schema.strip(),
    }),
}).required();

type RegisterFormData = yup.InferType<typeof registerSchema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const { setUser } = useAuth();

  const {
    register,
    watch,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(registerSchema),
    shouldUnregister: true,
    defaultValues: {
      role: "parent",
      nanny: { availability: weekdays.map(() => false) },
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);

    const backendPayload = {
      email: data.email,
      email_confirm: data.email,
      password: data.password,
      password_confirm: data.confirmPassword,
      name: "New",
      surname: "User",
      type: 1,
    };

    let res: Response;
    try {
      res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(backendPayload),
      });
    } catch {
      setServerError("Could not reach the server. Is it running?");
      return;
    }

    const body = await res.json().catch(() => null);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setServerError(body?.error ?? "Registration failed");
      return;
    }

    if (body?.user) {
      setUser(body.user);
    }

    console.log("Registration ok");
    navigate("/");
  };

  const selectedRole = watch("role");
  const availability =
    watch("nanny.availability") ?? weekdays.map(() => false);

  return (
    <div className="register-container">
      <div className="register-box">
        <img src={logo} alt="MOMent-logo" className="logo" />

        <form onSubmit={handleSubmit(onSubmit)} className="register-form">
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

          <div className="input-field">
            <input
              type="password"
              placeholder="Confirm Password"
              className="input"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="error-text">{errors.confirmPassword.message}</p>
            )}
          </div>

          <fieldset className="role-section">
            <legend className="section-title">I am a</legend>
            <div className="role-options">
              <label className="role-option">
                <input type="radio" value="parent" {...register("role")} />
                Parent
              </label>
              <label className="role-option">
                <input type="radio" value="nanny" {...register("role")} />
                Nanny
              </label>
            </div>
            {errors.role && (
              <p className="error-text">{errors.role.message}</p>
            )}
          </fieldset>

          {selectedRole === "parent" && (
            <div className="address-section">
              <p className="section-title">Exact Address</p>

              <div className="input-field">
                <input
                  type="text"
                  placeholder="Street"
                  className="input"
                  {...register("address.street")}
                />
                {errors.address?.street && (
                  <p className="error-text">{errors.address.street.message}</p>
                )}
              </div>

              <div className="input-row">
                <div className="input-field">
                  <input
                    type="text"
                    placeholder="House Number / Apartment"
                    className="input"
                    {...register("address.houseNumber")}
                  />
                  {errors.address?.houseNumber && (
                    <p className="error-text">
                      {errors.address.houseNumber.message}
                    </p>
                  )}
                </div>

                <div className="input-field">
                  <input
                    type="text"
                    placeholder="Apartment"
                    className="input"
                    {...register("address.apartament")}
                  />
                  {errors.address?.apartament && (
                    <p className="error-text">
                      {errors.address.apartament.message}
                    </p>
                  )}
                </div>

                <div className="input-field">
                  <input
                    type="text"
                    placeholder="Postal Code (e.g., 00-000)"
                    className="input"
                    {...register("address.postalCode")}
                  />
                  {errors.address?.postalCode && (
                    <p className="error-text">
                      {errors.address.postalCode.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="input-field">
                <input
                  type="text"
                  placeholder="City"
                  className="input"
                  {...register("address.city")}
                />
                {errors.address?.city && (
                  <p className="error-text">{errors.address.city.message}</p>
                )}
              </div>
            </div>
          )}

          {selectedRole === "nanny" && (
            <div className="address-section">
              <p className="section-title">Nanny Details</p>

              <div className="input-field">
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="input"
                  {...register("nanny.phone_number")}
                />
                {errors.nanny?.phone_number && (
                  <p className="error-text">
                    {errors.nanny.phone_number.message}
                  </p>
                )}
              </div>

              <div className="input-field">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Hourly rate"
                  className="input"
                  {...register("nanny.hourly_wage")}
                />
                {errors.nanny?.hourly_wage && (
                  <p className="error-text">
                    {errors.nanny.hourly_wage.message}
                  </p>
                )}
              </div>

              <fieldset className="availability-section">
                <legend className="section-title">Available days</legend>
                <div className="availability-days">
                  {weekdays.map((day, index) => (
                    <label className="availability-option" key={day}>
                      <input
                        type="checkbox"
                        checked={Boolean(availability[index])}
                        onChange={(event) => {
                          const updatedAvailability = [...availability];
                          updatedAvailability[index] = event.target.checked;
                          setValue("nanny.availability", updatedAvailability, {
                            shouldDirty: true,
                            shouldValidate: true,
                          });
                        }}
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          )}

          {serverError && <p className="error-text">{serverError}</p>}

          <button
            type="submit"
            className="register-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      </div>
    </div>
  );
}
