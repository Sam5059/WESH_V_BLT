import { useState } from 'react';
import { ModalType } from '@/components/CustomModal';

interface ModalConfig {
  type: ModalType;
  title: string;
  message: string;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export function useCustomModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState<ModalConfig>({
    type: 'info',
    title: '',
    message: '',
  });

  const showModal = (config: ModalConfig) => {
    setModalConfig(config);
    setIsVisible(true);
  };

  const hideModal = () => {
    setIsVisible(false);
  };

  const showSuccess = (title: string, message: string, onConfirm?: () => void) => {
    showModal({
      type: 'success',
      title,
      message,
      onConfirm,
      confirmText: 'OK',
    });
  };

  const showError = (title: string, message: string) => {
    showModal({
      type: 'error',
      title,
      message,
      confirmText: 'OK',
    });
  };

  const showInfo = (title: string, message: string) => {
    showModal({
      type: 'info',
      title,
      message,
      confirmText: 'OK',
    });
  };

  const showConfirm = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'Confirmer',
    cancelText: string = 'Annuler'
  ) => {
    showModal({
      type: 'confirm',
      title,
      message,
      onConfirm,
      confirmText,
      cancelText,
      showCancel: true,
    });
  };

  return {
    isVisible,
    modalConfig,
    hideModal,
    showSuccess,
    showError,
    showInfo,
    showConfirm,
  };
}
