"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PrimaryButton } from "@/components/core/buttons/primary";
import { SecondaryButton } from "@/components/core/buttons/secondary";
import { cn } from "@/lib/utils";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiInfo,
  FiAlertTriangle,
} from "react-icons/fi";

export type AlertType = "success" | "error" | "warning" | "info" | "confirm";

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  message: string;
  type?: AlertType;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
  loading?: boolean;
}

const alertConfig = {
  success: {
    icon: FiCheckCircle,
    iconColor: "text-success-600",
    bgColor: "bg-success-50",
    borderColor: "border-success-200",
    titleColor: "text-success-900",
  },
  error: {
    icon: FiXCircle,
    iconColor: "text-danger-600",
    bgColor: "bg-danger-50",
    borderColor: "border-danger-200",
    titleColor: "text-danger-900",
  },
  warning: {
    icon: FiAlertTriangle,
    iconColor: "text-warning-600",
    bgColor: "bg-warning-50",
    borderColor: "border-warning-200",
    titleColor: "text-warning-900",
  },
  info: {
    icon: FiInfo,
    iconColor: "text-info-600",
    bgColor: "bg-info-50",
    borderColor: "border-info-200",
    titleColor: "text-info-900",
  },
  confirm: {
    icon: FiAlertCircle,
    iconColor: "text-primary-600",
    bgColor: "bg-primary-50",
    borderColor: "border-primary-200",
    titleColor: "text-primary-900",
  },
};

export function AlertDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = "info",
  confirmText = "OK",
  cancelText = "Cancel",
  showCancel = false,
  loading = false,
}: AlertDialogProps) {
  const config = alertConfig[type];
  const IconComponent = config.icon;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto mb-4 flex items-center justify-center rounded-3xl bg-white shadow-sm border-1 border-gray-200">
            <div className={cn(
              "flex h-16 w-16 items-center justify-center rounded-3xl",
              config.bgColor,
              config.borderColor
            )}>
              <IconComponent className={cn("h-8 w-8", config.iconColor)} />
            </div>
          </div>
          <DialogTitle className={cn(
            "text-xl font-semibold leading-6",
            config.titleColor
          )}>
            {title}
          </DialogTitle>
          <DialogDescription className="mt-2 text-base text-gray-600 leading-relaxed">
            {message}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center sm:gap-3">
          {showCancel && (
            <SecondaryButton
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto min-w-[100px]"
            >
              {cancelText}
            </SecondaryButton>
          )}
          <PrimaryButton
            onClick={handleConfirm}
            disabled={loading}
            className="w-full sm:w-auto min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading...</span>
              </div>
            ) : (
              confirmText
            )}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook for easier usage
export function useAlertDialog() {
  const [alertState, setAlertState] = React.useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: AlertType;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    loading?: boolean;
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  });

  const showAlert = React.useCallback((options: {
    title: string;
    message: string;
    type?: AlertType;
    onConfirm?: () => void;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
  }) => {
    setAlertState({
      isOpen: true,
      ...options,
      type: options.type || "info",
    });
  }, []);

  const showSuccess = React.useCallback((title: string, message: string) => {
    showAlert({ title, message, type: "success" });
  }, [showAlert]);

  const showError = React.useCallback((title: string, message: string) => {
    showAlert({ title, message, type: "error" });
  }, [showAlert]);

  const showWarning = React.useCallback((title: string, message: string) => {
    showAlert({ title, message, type: "warning" });
  }, [showAlert]);

  const showInfo = React.useCallback((title: string, message: string) => {
    showAlert({ title, message, type: "info" });
  }, [showAlert]);

  const showConfirm = React.useCallback((
    title: string,
    message: string,
    onConfirm: () => void,
    options?: {
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showAlert({
      title,
      message,
      type: "confirm",
      onConfirm,
      showCancel: true,
      confirmText: options?.confirmText || "Confirm",
      cancelText: options?.cancelText || "Cancel",
    });
  }, [showAlert]);

  const closeAlert = React.useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const setLoading = React.useCallback((loading: boolean) => {
    setAlertState(prev => ({ ...prev, loading }));
  }, []);

  return {
    ...alertState,
    showAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm,
    closeAlert,
    setLoading,
    AlertDialog: () => (
      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={closeAlert}
        onConfirm={alertState.onConfirm}
        title={alertState.title}
        message={alertState.message}
        type={alertState.type}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
        loading={alertState.loading}
      />
    ),
  };
}
