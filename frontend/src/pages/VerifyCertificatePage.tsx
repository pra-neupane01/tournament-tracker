import { useQuery } from '@tanstack/react-query';
import { Search, ShieldCheck, ShieldX } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { assetService } from '../features/assets/assetService';
import { formatDateTime } from '../utils/date';

export function VerifyCertificatePage() {
  const params = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(params.verificationCode ?? '');
  const certificate = useQuery({
    queryKey: ['certificate-verification', params.verificationCode],
    queryFn: () => assetService.verifyCertificate(params.verificationCode!),
    enabled: Boolean(params.verificationCode),
    retry: false,
  });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    navigate(`/verify-certificate/${encodeURIComponent(code.trim())}`);
  };

  return (
    <div className="auth-page">
      <div className="verification-card">
        <Link to="/" className="auth-logo">
          <ShieldCheck />
        </Link>
        <div className="text-center">
          <h1>Verify certificate</h1>
          <p>Enter the verification code printed on the PDF.</p>
        </div>
        <form className="inline-form" onSubmit={submit}>
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Verification code"
            required
          />
          <button className="button button-primary">
            <Search /> Verify
          </button>
        </form>
        {certificate.isError && (
          <div className="verification-result invalid">
            <ShieldX />
            <div>
              <h2>Certificate not valid</h2>
              <p>The code was not found or cannot be verified.</p>
            </div>
          </div>
        )}
        {certificate.data && (
          <div
            className={`verification-result ${certificate.data.revoked ? 'invalid' : 'valid'}`}
          >
            {certificate.data.revoked ? <ShieldX /> : <ShieldCheck />}
            <div>
              <h2>
                {certificate.data.revoked ? 'Revoked certificate' : 'Valid certificate'}
              </h2>
              <p>{certificate.data.title}</p>
              <dl>
                <div>
                  <dt>Recipient</dt>
                  <dd>{certificate.data.recipientName}</dd>
                </div>
                <div>
                  <dt>Tournament</dt>
                  <dd>{certificate.data.tournamentName}</dd>
                </div>
                <div>
                  <dt>Serial</dt>
                  <dd>{certificate.data.serialNumber}</dd>
                </div>
                <div>
                  <dt>Issued</dt>
                  <dd>{formatDateTime(certificate.data.issuedAt)}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
