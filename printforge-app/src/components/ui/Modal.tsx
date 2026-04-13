"use client";

import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-[#111318] border border-[var(--glass-border)] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-8 m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-2xl text-[var(--text-secondary)] hover:text-white cursor-pointer bg-transparent border-none"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
