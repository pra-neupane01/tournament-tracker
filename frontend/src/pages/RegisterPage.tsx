import { zodResolver } from '@hookform/resolvers/zod';
import { Trophy, UserRoundPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuthStore } from '../features/auth/authStore';
import { getErrorMessage } from '../utils/apiError';

const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name').max(120),
    email: z.email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters').max(72),
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const registerAccount = useAuthStore((state) => state.register);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [submitError, setSubmitError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const submit = handleSubmit(async ({ confirmPassword: _, ...input }) => {
    setSubmitError('');
    try {
      await registerAccount(input);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setSubmitError(getErrorMessage(error, 'Could not create your account'));
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo" aria-label="EsportsManager home">
          <Trophy />
        </Link>
        <div className="text-center">
          <h1>Create your account</h1>
          <p>Join a team, compete, referee, or organize tournaments.</p>
        </div>

        <form onSubmit={submit} className="form-stack">
          {submitError && <div className="alert alert-error">{submitError}</div>}
          <label className="field">
            <span>Full name</span>
            <input {...register('fullName')} autoComplete="name" />
            {errors.fullName && <small>{errors.fullName.message}</small>}
          </label>
          <label className="field">
            <span>Email address</span>
            <input {...register('email')} type="email" autoComplete="email" />
            {errors.email && <small>{errors.email.message}</small>}
          </label>
          <label className="field">
            <span>Password</span>
            <input {...register('password')} type="password" autoComplete="new-password" />
            {errors.password && <small>{errors.password.message}</small>}
          </label>
          <label className="field">
            <span>Confirm password</span>
            <input
              {...register('confirmPassword')}
              type="password"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <small>{errors.confirmPassword.message}</small>}
          </label>
          <button className="button button-primary" disabled={isSubmitting}>
            <UserRoundPlus />
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="auth-switch">
          Already registered? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
