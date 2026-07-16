import { apiClient } from '../../services/api/apiClient';
import type { APIResponse } from '../../types/api';
import type {
  Certificate,
  CertificateType,
  FileCategory,
  ReportType,
  StoredFile,
} from './types';

export const assetService = {
  upload: async (
    file: File,
    input: {
      tournamentId: string;
      category: FileCategory;
      privateFile: boolean;
    },
  ) => {
    const form = new FormData();
    form.append('file', file);
    const response = await apiClient.post<APIResponse<StoredFile>>('/files', form, {
      params: input,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },
  downloadFile: async (fileId: string) => {
    const response = await apiClient.get<Blob>(`/files/${fileId}`, {
      responseType: 'blob',
    });
    return response.data;
  },
  removeFile: (fileId: string) => apiClient.delete(`/files/${fileId}`),
  report: async (tournamentId: string, type: ReportType, stageId?: string) => {
    const response = await apiClient.get<Blob>(
      `/tournaments/${tournamentId}/reports/${type}`,
      { params: { stageId }, responseType: 'blob' },
    );
    return response.data;
  },
  certificates: async (tournamentId: string) => {
    const response = await apiClient.get<APIResponse<Certificate[]>>(
      `/tournaments/${tournamentId}/certificates`,
    );
    return response.data.data;
  },
  myCertificates: async () => {
    const response = await apiClient.get<APIResponse<Certificate[]>>('/certificates/mine');
    return response.data.data;
  },
  issueCertificate: async (
    tournamentId: string,
    input: {
      recipientId: string;
      registrationId: string | null;
      type: CertificateType;
      title: string;
    },
  ) => {
    const response = await apiClient.post<APIResponse<Certificate>>(
      `/tournaments/${tournamentId}/certificates`,
      input,
    );
    return response.data.data;
  },
  revokeCertificate: async (certificateId: string) => {
    const response = await apiClient.post<APIResponse<Certificate>>(
      `/certificates/${certificateId}/revoke`,
    );
    return response.data.data;
  },
  downloadCertificate: async (certificateId: string) => {
    const response = await apiClient.get<Blob>(`/certificates/${certificateId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
  verifyCertificate: async (verificationCode: string) => {
    const response = await apiClient.get<APIResponse<Certificate>>(
      `/certificates/verify/${verificationCode}`,
    );
    return response.data.data;
  },
};
