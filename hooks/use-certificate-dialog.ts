import { useState, useCallback } from 'react';
import { courseService } from '@/lib/course-service';

export interface CertificateDialogState {
  showCertificateDialog: boolean;
}

export interface CertificateDialogActions {
  openCertificateDialog: () => void;
  closeCertificateDialog: () => void;
  downloadCertificate: (certificateId?: string, certificateUrl?: string) => void;
}

export function useCertificateDialog(): [CertificateDialogState, CertificateDialogActions] {
  const [state, setState] = useState<CertificateDialogState>({
    showCertificateDialog: false,
  });

  const openCertificateDialog = useCallback(() => {
    setState(prev => ({ ...prev, showCertificateDialog: true }));
  }, []);

  const closeCertificateDialog = useCallback(() => {
    setState(prev => ({ ...prev, showCertificateDialog: false }));
  }, []);

  const downloadCertificate = useCallback((certificateId?: string, certificateUrl?: string) => {
    if (certificateUrl) {
      // If we have a direct URL, use it
      const link = document.createElement('a');
      link.href = certificateUrl;
      link.download = `certificate-${certificateId || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (certificateId) {
      // If we have a certificate ID, try to generate a download URL
      try {
        // For now, generate a placeholder certificate URL
        // In a real implementation, this would call an API to generate/get the certificate PDF
        const certificateData = {
          id: certificateId,
          issuedDate: new Date().toISOString(),
          studentName: 'Student Name', // This would come from the API
          courseName: 'Course Name', // This would come from the API
        };
        
        // Create a simple certificate content (in real app, this would be a PDF generation service)
        const certificateContent = `
          <html>
            <head><title>Certificate of Completion</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1>Certificate of Completion</h1>
              <p>This certifies that</p>
              <h2>${certificateData.studentName}</h2>
              <p>has successfully completed</p>
              <h3>${certificateData.courseName}</h3>
              <p>Issued on: ${new Date(certificateData.issuedDate).toLocaleDateString()}</p>
              <p>Certificate ID: ${certificateData.id}</p>
            </body>
          </html>
        `;
        
        const blob = new Blob([certificateContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${certificateId}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading certificate:', error);
        alert('Error downloading certificate. Please try again.');
      }
    } else {
      // Fallback to print dialog
      window.print();
    }
  }, []);

  const actions: CertificateDialogActions = {
    openCertificateDialog,
    closeCertificateDialog,
    downloadCertificate,
  };

  return [state, actions];
}
