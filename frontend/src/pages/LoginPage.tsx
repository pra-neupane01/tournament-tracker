import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthStore } from "../features/auth/authStore";
import { getErrorMessage } from "../utils/apiError";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [submitError, setSubmitError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = handleSubmit(async (input) => {
    setSubmitError("");
    try {
      await login(input);
      const destination =
        typeof location.state === "object" &&
        location.state &&
        "from" in location.state &&
        typeof location.state.from === "string"
          ? location.state.from
          : "/dashboard";
      navigate(destination, { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, "Could not sign in"));
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link
          to="/"
          className="auth-logo bg-transparent border-0"
          aria-label="ArenaHub home"
        >
          <img
            src="/logo.png"
            alt="ArenaHub"
            className="h-10 w-auto object-contain"
          />
        </Link>
        <div className="text-center">
          <h1>Welcome back</h1>
          <p>Sign in to manage or join your competitions.</p>
        </div>

        <form onSubmit={submit} className="form-stack">
          {submitError && (
            <div className="alert alert-error">{submitError}</div>
          )}
          <label className="field">
            <span>Email address</span>
            <input
              {...register("email")}
              type="email"
              autoComplete="email"
              autoFocus
            />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label className="field">
            <span>Password</span>
            <input
              {...register("password")}
              type="password"
              autoComplete="current-password"
            />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          <button className="button button-primary" disabled={isSubmitting}>
            <LogIn />
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          New to ArenaHub? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
