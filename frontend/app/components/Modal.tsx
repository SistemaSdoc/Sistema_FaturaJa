'use client';

import React, { ReactNode } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose} // Fecha ao clicar no fundo
    >
      <div
        className="bg-white rounded shadow-lg p-6 w-full max-w-lg relative"
        onClick={(e) => e.stopPropagation()} // Impede fechamento ao clicar no conteúdo
      >
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            className="text-gray-500 hover:text-gray-700 font-bold text-lg"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Conteúdo do modal */}
        <div>{children}</div>
      </div>
    </div>
  );
}
