import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BellRing,
  Download,
  FileDown,
  FileUp,
  Medal,
  Send,
  Trash2,
} from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { LoadingState } from '../components/common/LoadingState';
import { TournamentHeader } from '../components/tournament/TournamentHeader';
import { TournamentNav } from '../components/tournament/TournamentNav';
import { assetService } from '../features/assets/assetService';
import type {
  CertificateType,
  FileCategory,
  ReportType,
  StoredFile,
} from '../features/assets/types';
import { competitionService } from '../features/competition/competitionService';
import { notificationService } from '../features/notifications/notificationService';
import { registrationService } from '../features/registrations/registrationService';
import { tournamentService } from '../features/tournaments/tournamentService';
import { getErrorMessage } from '../utils/apiError';
import { formatDateTime } from '../utils/date';
import { saveBlob } from '../utils/download';

export function TournamentAssetsPage() {
  const { tournamentId = '' } = useParams();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'files' | 'reports' | 'certificates' | 'announce'>('files');
  const [uploadedFiles, setUploadedFiles] = useState<StoredFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<FileCategory>('OTHER');
  const [privateFile, setPrivateFile] = useState(true);
  const [reportType, setReportType] = useState<ReportType>('REGISTRATIONS');
  const [reportStageId, setReportStageId] = useState('');
  const [notice, setNotice] = useState('');
  const [success, setSuccess] = useState(false);
  const [certificate, setCertificate] = useState({
    recipientId: '',
    registrationId: null as string | null,
    type: 'PARTICIPATION' as CertificateType,
    title: 'Certificate of Participation',
  });
  const [announcement, setAnnouncement] = useState({ title: '', message: '' });

  const tournament = useQuery({
    queryKey: ['tournament', tournamentId],
    queryFn: () => tournamentService.get(tournamentId),
  });
  const stages = useQuery({
    queryKey: ['stages', tournamentId],
    queryFn: () => competitionService.stages(tournamentId),
  });
  const registrations = useQuery({
    queryKey: ['registrations', tournamentId, 'APPROVED'],
    queryFn: () => registrationService.list(tournamentId, 'APPROVED'),
    retry: false,
  });
  const certificates = useQuery({
    queryKey: ['certificates', tournamentId],
    queryFn: () => assetService.certificates(tournamentId),
    retry: false,
  });

  const fail = (error: unknown) => {
    setSuccess(false);
    setNotice(getErrorMessage(error));
  };
  const upload = useMutation({
    mutationFn: () =>
      assetService.upload(selectedFile!, {
        tournamentId,
        category,
        privateFile,
      }),
    onSuccess: (file) => {
      setUploadedFiles((current) => [file, ...current]);
      setSelectedFile(null);
      setNotice('');
    },
    onError: fail,
  });
  const removeFile = useMutation({
    mutationFn: assetService.removeFile,
    onSuccess: (_, fileId) =>
      setUploadedFiles((current) => current.filter((file) => file.id !== fileId)),
    onError: fail,
  });
  const issueCertificate = useMutation({
    mutationFn: () => assetService.issueCertificate(tournamentId, certificate),
    onSuccess: async () => {
      setNotice('');
      await queryClient.invalidateQueries({ queryKey: ['certificates', tournamentId] });
    },
    onError: fail,
  });
  const revokeCertificate = useMutation({
    mutationFn: assetService.revokeCertificate,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['certificates', tournamentId] }),
    onError: fail,
  });
  const announce = useMutation({
    mutationFn: () => notificationService.announce(tournamentId, announcement),
    onSuccess: () => {
      setAnnouncement({ title: '', message: '' });
      setSuccess(true);
      setNotice('Announcement sent to approved registrants.');
    },
    onError: fail,
  });

  if (tournament.isLoading) {
    return <LoadingState message="Loading tournament assets..." />;
  }
  if (tournament.isError || !tournament.data) {
    return <ErrorState message={getErrorMessage(tournament.error)} />;
  }

  const recipients =
    registrations.data?.content.flatMap((registration) =>
      registration.roster.map((player) => ({
        userId: player.userId,
        name: `${player.fullName} (${registration.teamName})`,
        registrationId: registration.id,
      })),
    ) ?? [];

  const uploadFile = (event: FormEvent) => {
    event.preventDefault();
    if (selectedFile) upload.mutate();
  };

  return (
    <div className="tournament-page">
      <TournamentHeader tournament={tournament.data} />
      <TournamentNav tournamentId={tournamentId} />
      <div className="tournament-page-body">
        <div className="builder-heading">
          <div>
            <h2>Files, reports & certificates</h2>
            <p>Operational exports, controlled documents, awards, and announcements.</p>
          </div>
        </div>
        {notice && (
          <div className={`alert ${success ? 'alert-success' : 'alert-error'} mb-5`}>
            {notice}
          </div>
        )}
        <div className="operation-tabs">
          <button className={tab === 'files' ? 'active' : ''} onClick={() => setTab('files')}>
            <FileUp /> Files
          </button>
          <button className={tab === 'reports' ? 'active' : ''} onClick={() => setTab('reports')}>
            <FileDown /> Reports
          </button>
          <button
            className={tab === 'certificates' ? 'active' : ''}
            onClick={() => setTab('certificates')}
          >
            <Medal /> Certificates
          </button>
          <button className={tab === 'announce' ? 'active' : ''} onClick={() => setTab('announce')}>
            <BellRing /> Announce
          </button>
        </div>

        {tab === 'files' && (
          <section className="panel asset-section">
            <div className="section-heading">
              <FileUp />
              <div>
                <h2>Secure file storage</h2>
                <p>Files are checksummed and access-controlled by category and tournament.</p>
              </div>
            </div>
            <form className="upload-form" onSubmit={uploadFile}>
              <label className="field">
                <span>File</span>
                <input
                  type="file"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  required
                />
              </label>
              <label className="field">
                <span>Category</span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value as FileCategory)}
                >
                  {fileCategories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  checked={privateFile}
                  onChange={(event) => setPrivateFile(event.target.checked)}
                />{' '}
                Private file
              </label>
              <button className="button button-primary" disabled={!selectedFile || upload.isPending}>
                <FileUp /> Upload
              </button>
            </form>
            <div className="file-list">
              {uploadedFiles.map((file) => (
                <article key={file.id}>
                  <div>
                    <strong>{file.originalName}</strong>
                    <span>
                      {file.category} · {(file.sizeBytes / 1024).toFixed(1)} KB · SHA{' '}
                      {file.sha256.slice(0, 12)}…
                    </span>
                  </div>
                  <button
                    className="icon-button"
                    onClick={async () =>
                      saveBlob(await assetService.downloadFile(file.id), file.originalName)
                    }
                  >
                    <Download />
                  </button>
                  <button
                    className="icon-button danger"
                    onClick={() => removeFile.mutate(file.id)}
                  >
                    <Trash2 />
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === 'reports' && (
          <section className="panel asset-section">
            <div className="section-heading">
              <FileDown />
              <div>
                <h2>CSV reports</h2>
                <p>Export registrations, fixtures, or stage leaderboard data.</p>
              </div>
            </div>
            <div className="report-controls">
              <label className="field">
                <span>Report</span>
                <select
                  value={reportType}
                  onChange={(event) => setReportType(event.target.value as ReportType)}
                >
                  <option value="REGISTRATIONS">Registrations</option>
                  <option value="FIXTURES">Fixtures</option>
                  <option value="LEADERBOARD">Leaderboard</option>
                </select>
              </label>
              {reportType === 'LEADERBOARD' && (
                <label className="field">
                  <span>Stage</span>
                  <select
                    value={reportStageId}
                    onChange={(event) => setReportStageId(event.target.value)}
                    required
                  >
                    <option value="">Select stage</option>
                    {stages.data?.map((stage) => (
                      <option key={stage.id} value={stage.id}>
                        {stage.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
              <button
                className="button button-primary"
                disabled={reportType === 'LEADERBOARD' && !reportStageId}
                onClick={async () => {
                  try {
                    const blob = await assetService.report(
                      tournamentId,
                      reportType,
                      reportStageId || undefined,
                    );
                    saveBlob(blob, `${tournament.data.slug}-${reportType.toLowerCase()}.csv`);
                  } catch (error) {
                    fail(error);
                  }
                }}
              >
                <Download /> Download report
              </button>
            </div>
          </section>
        )}

        {tab === 'certificates' && (
          <div className="asset-grid">
            <section className="panel asset-section">
              <div className="section-heading">
                <Medal />
                <div>
                  <h2>Issue certificate</h2>
                  <p>Create a verifiable PDF award for an approved participant.</p>
                </div>
              </div>
              <form
                className="form-stack"
                onSubmit={(event) => {
                  event.preventDefault();
                  issueCertificate.mutate();
                }}
              >
                <label className="field">
                  <span>Recipient</span>
                  <select
                    value={`${certificate.recipientId}|${certificate.registrationId ?? ''}`}
                    onChange={(event) => {
                      const [recipientId, registrationId] = event.target.value.split('|');
                      setCertificate({
                        ...certificate,
                        recipientId,
                        registrationId: registrationId || null,
                      });
                    }}
                    required
                  >
                    <option value="|">Select participant</option>
                    {recipients.map((recipient) => (
                      <option
                        key={`${recipient.userId}-${recipient.registrationId}`}
                        value={`${recipient.userId}|${recipient.registrationId}`}
                      >
                        {recipient.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Certificate type</span>
                  <select
                    value={certificate.type}
                    onChange={(event) =>
                      setCertificate({
                        ...certificate,
                        type: event.target.value as CertificateType,
                      })
                    }
                  >
                    {certificateTypes.map((type) => (
                      <option key={type}>{type}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span>Title</span>
                  <input
                    value={certificate.title}
                    onChange={(event) =>
                      setCertificate({ ...certificate, title: event.target.value })
                    }
                    required
                  />
                </label>
                <button className="button button-primary" disabled={issueCertificate.isPending}>
                  Issue certificate
                </button>
              </form>
            </section>
            <section className="panel asset-section">
              <div className="section-heading">
                <Medal />
                <div>
                  <h2>Issued certificates</h2>
                  <p>Download, verify, or revoke tournament awards.</p>
                </div>
              </div>
              {certificates.isLoading && <LoadingState message="Loading certificates..." />}
              {certificates.data?.length === 0 && <EmptyState title="No certificates issued" />}
              <div className="certificate-list">
                {certificates.data?.map((item) => (
                  <article key={item.id}>
                    <div>
                      <strong>{item.recipientName}</strong>
                      <span>
                        {item.title} · {item.serialNumber}
                      </span>
                      <small>
                        {formatDateTime(item.issuedAt)} · verify: {item.verificationCode}
                      </small>
                    </div>
                    <button
                      className="icon-button"
                      onClick={async () =>
                        saveBlob(
                          await assetService.downloadCertificate(item.id),
                          `${item.serialNumber}.pdf`,
                        )
                      }
                    >
                      <Download />
                    </button>
                    {!item.revoked && (
                      <button
                        className="icon-button danger"
                        onClick={() => revokeCertificate.mutate(item.id)}
                      >
                        <Trash2 />
                      </button>
                    )}
                  </article>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'announce' && (
          <section className="panel asset-section">
            <div className="section-heading">
              <BellRing />
              <div>
                <h2>Tournament announcement</h2>
                <p>Send persistent and live notifications to approved registrants.</p>
              </div>
            </div>
            <form
              className="form-stack"
              onSubmit={(event) => {
                event.preventDefault();
                announce.mutate();
              }}
            >
              <label className="field">
                <span>Title</span>
                <input
                  value={announcement.title}
                  onChange={(event) =>
                    setAnnouncement({ ...announcement, title: event.target.value })
                  }
                  required
                />
              </label>
              <label className="field">
                <span>Message</span>
                <textarea
                  rows={6}
                  value={announcement.message}
                  onChange={(event) =>
                    setAnnouncement({ ...announcement, message: event.target.value })
                  }
                  required
                />
              </label>
              <button className="button button-primary" disabled={announce.isPending}>
                <Send /> Send announcement
              </button>
            </form>
          </section>
        )}
      </div>
    </div>
  );
}

const fileCategories: FileCategory[] = [
  'LOGO',
  'RULEBOOK',
  'EVIDENCE',
  'REGISTRATION',
  'CERTIFICATE',
  'OTHER',
];
const certificateTypes: CertificateType[] = [
  'PARTICIPATION',
  'WINNER',
  'RUNNER_UP',
  'ACHIEVEMENT',
];
