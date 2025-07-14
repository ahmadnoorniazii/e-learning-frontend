import { useState, useCallback } from 'react';

export interface CertificateDialogState {
  showCertificateDialog: boolean;
}

export interface CertificateDialogActions {
  openCertificateDialog: () => void;
  closeCertificateDialog: () => void;
  downloadCertificate: () => void;
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

  const downloadCertificate = useCallback(() => {
    window.print();
  }, []);

  const actions: CertificateDialogActions = {
    openCertificateDialog,
    closeCertificateDialog,
    downloadCertificate,
  };

  return [state, actions];
}
