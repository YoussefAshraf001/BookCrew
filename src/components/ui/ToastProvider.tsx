"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { Toaster, toast } from "react-hot-toast";

type ToastTone = "info" | "success" | "error";

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export default function ToastProvider({ children }: { children: ReactNode }) {
  const showToast = useCallback((message: string, tone: ToastTone = "info") => {
    if (tone === "success") {
      toast.success(message);
      return;
    }

    if (tone === "error") {
      toast.error(message);
      return;
    }

    toast(message);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2600,
          style: {
            borderRadius: "12px",
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--accent-soft)",
            fontSize: "14px",
            fontWeight: "600",
          },
          success: {
            style: {
              border: "1px solid #64b5a2",
            },
          },
          error: {
            style: {
              border: "1px solid #d88f8f",
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used inside ToastProvider.");
  }

  return context;
}
