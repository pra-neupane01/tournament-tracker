import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { PageContainer } from '../components/layout/PageContainer';
import { authService } from '../features/auth/authService';
import { useAuthStore } from '../features/auth/authStore';
import { getErrorMessage } from '../utils/apiError';

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: z.string().min(8, 'Use at least 8 characters').max(72),
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type PasswordForm = z.infer<typeof passwordSchema>;

export function SettingsPage() {
  const user = useAuthStore((state) => state.user);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) });

  const submit = handleSubmit(async ({ confirmPassword: _, ...input }) => {
    setNotice(null);
    try {
      await authService.changePassword(input);
      reset();
      setNotice({ type: 'success', message: 'Password changed successfully.' });
    } catch (error) {
      setNotice({ type: 'error', message: getErrorMessage(error) });
    }
  });

  return (
    <PageContainer title="Account & security" description="Review your account and credentials.">
      <div className="settings-grid">
        <section className="panel">
          <div className="section-heading">
            <ShieldCheck />
            <div>
              <h2>Account</h2>
              <p>Your authenticated profile and platform access.</p>
            </div>
          </div>
          <dl className="detail-list">
            <div>
              <dt>Name</dt>
              <dd>{user?.fullName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{user?.email}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{user?.role.replaceAll('_', ' ')}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{user?.enabled ? 'Enabled' : 'Disabled'}</dd>
            </div>
          </dl>
        </section>

        <section className="panel">
          <div className="section-heading">
            <KeyRound />
            <div>
              <h2>Change password</h2>
              <p>Use a unique password with at least eight characters.</p>
            </div>
          </div>
          <form onSubmit={submit} className="form-stack">
            {notice && (
              <div className={`alert alert-${notice.type}`} role="status">
                {notice.message}
              </div>
            )}
            <label className="field">
              <span>Current password</span>
              <input
                {...register('currentPassword')}
                type="password"
                autoComplete="current-password"
              />
              {errors.currentPassword && <small>{errors.currentPassword.message}</small>}
            </label>
            <label className="field">
              <span>New password</span>
              <input {...register('newPassword')} type="password" autoComplete="new-password" />
              {errors.newPassword && <small>{errors.newPassword.message}</small>}
            </label>
            <label className="field">
              <span>Confirm new password</span>
              <input
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
              />
              {errors.confirmPassword && <small>{errors.confirmPassword.message}</small>}
            </label>
            <button className="button button-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </section>
      </div>
    </PageContainer>
  );
}
