interface ModalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ show, onClose, children }: ModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
      <div className="bg-white p-4 rounded relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  );
}
