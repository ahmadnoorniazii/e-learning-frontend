import { useState, useEffect, useCallback, useMemo } from 'react';
import { apiClient } from '@/lib/api-client';
import type { Certificate } from '@/lib/api-client';

export interface StudentCertificate {
  id: number;
  documentId: string;
  certificateId: string;
  verificationCode: string;
  issuedDate: string;
  certificateUrl?: string;
  isValid: boolean;
  course: {
    id: number;
    title: string;
    instructor?: {
      username: string;
    };
  };
  student: {
    id: number;
    username: string;
    email: string;
  };
}

interface UseStudentCertificatesOptions {
  userId?: number;
  populate?: string[];
}

interface UseStudentCertificatesReturn {
  certificates: StudentCertificate[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  totalCertificates: number;
}

export function useStudentCertificates(options: UseStudentCertificatesOptions = {}): UseStudentCertificatesReturn {
  const [certificates, setCertificates] = useState<StudentCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { userId } = options;
  
  // Memoize the populate array to prevent unnecessary re-renders
  const populate = useMemo(() => 
    options.populate || ['course', 'student'], 
    [options.populate ? JSON.stringify(options.populate) : null]
  );

  const fetchCertificates = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setCertificates([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getCertificates({
        filters: {
          student: { id: { $eq: userId } },
          isValid: { $eq: true }
        },
        populate,
        pageSize: 100
      });

      const processedCertificates: StudentCertificate[] = response.data.map((certificate) => ({
        id: certificate.id,
        documentId: certificate.documentId,
        certificateId: certificate.certificateId,
        verificationCode: certificate.verificationCode,
        issuedDate: certificate.issuedDate,
        certificateUrl: certificate.certificateUrl,
        isValid: certificate.isValid,
        course: {
          id: (certificate.course as any)?.id || (certificate.course as any)?.data?.id,
          title: (certificate.course as any)?.title || (certificate.course as any)?.data?.attributes?.title,
          instructor: (certificate.course as any)?.instructor ? {
            username: (certificate.course as any).instructor?.username || (certificate.course as any).instructor?.data?.attributes?.username
          } : undefined
        },
        student: {
          id: (certificate.student as any)?.id || (certificate.student as any)?.data?.id,
          username: (certificate.student as any)?.username || (certificate.student as any)?.data?.attributes?.username,
          email: (certificate.student as any)?.email || (certificate.student as any)?.data?.attributes?.email
        }
      }));

      setCertificates(processedCertificates);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch certificates');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }, [userId, populate]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  return {
    certificates,
    loading,
    error,
    refetch: fetchCertificates,
    totalCertificates: certificates.length
  };
}
