import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getErrorMessage } from '../utils/apiError';
import { authService } from '../features/auth/authService';

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const token = params.get('token');
  const verify = useCallback(async () => {
    if (!token) { setStatus('error'); setMessage('This verification link is missing its token.'); return; }
    try { await authService.verifyEmail(token); setStatus('success'); setMessage('Email verified. You can now sign in.'); }
    catch (error) { setStatus('error'); setMessage(getErrorMessage(error, 'Verification failed')); }
  }, [token]);
  useEffect(() => { if (token) void verify(); }, [token, verify]);
  return <div className="auth-page"><div className="auth-card text-center">
    <h1>{status === 'success' ? 'Email verified' : 'Verify your email'}</h1>
    <p>{message || `We sent a verification link to ${params.get('email') ?? 'your email address'}.`}</p>
    {status === 'error' && <button className="button button-primary" onClick={() => void verify()}>Try again</button>}
    <p className="auth-switch"><Link to="/login">Continue to sign in</Link></p>
  </div></div>;
}
