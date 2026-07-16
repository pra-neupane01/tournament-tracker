import { useQuery } from '@tanstack/react-query';
import { Download, Medal, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { PageContainer } from '../components/layout/PageContainer';
import { assetService } from '../features/assets/assetService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';
import { saveBlob } from '../utils/download';

export function CertificatesPage() {
  const certificates = useQuery({
    queryKey: ['my-certificates'],
    queryFn: assetService.myCertificates,
  });

  return (
    <PageContainer
      title="My certificates"
      description="Download and share your verifiable tournament awards."
      action={
        <Link className="button button-secondary" to="/verify-certificate">
          <ShieldCheck /> Verify certificate
        </Link>
      }
    >
      {certificates.isLoading && <LoadingState message="Loading certificates..." />}
      {certificates.isError && <ErrorState message={getErrorMessage(certificates.error)} />}
      {certificates.data?.length === 0 && <EmptyState title="No certificates yet" />}
      <div className="certificate-grid">
        {certificates.data?.map((item) => (
          <article className="panel" key={item.id}>
            <Medal />
            <span className="eyebrow">{item.type.replaceAll('_', ' ')}</span>
            <h2>{item.title}</h2>
            <p>{item.tournamentName}</p>
            <small>
              {item.serialNumber} · {formatDateTime(item.issuedAt)}
            </small>
            <div className="review-actions">
              <button
                className="button button-primary"
                onClick={async () =>
                  saveBlob(
                    await assetService.downloadCertificate(item.id),
                    `${item.serialNumber}.pdf`,
                  )
                }
              >
                <Download /> Download PDF
              </button>
              <Link
                className="button button-secondary"
                to={`/verify-certificate/${item.verificationCode}`}
              >
                Verify
              </Link>
            </div>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
