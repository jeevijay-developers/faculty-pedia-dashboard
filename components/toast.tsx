"use client";

import { useState, useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "warning";
  duration?: number;
  onClose: () => void;
}

export function Toast({ 
  message, 
  type = "success", 
  duration = 3000, 
  onClose 
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-green-50 border-green-200";
    }
  };

  const getTextColor = () => {
    switch (type) {
      case "success":
        return "text-green-800";
      case "error":
        return "text-red-800";
      case "warning":
        return "text-yellow-800";
      default:
        return "text-green-800";
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-lg border p-4 shadow-lg ${getBgColor()} ${getTextColor()} animate-in slide-in-from-top-2 duration-300`}>
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast Provider Hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{
    id: string;
    message: string;
    type: "success" | "error" | "warning";
  }>>([]);

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  );

  return { showToast, ToastContainer };
}