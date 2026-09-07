import { useToast } from "../../../context/ToastContext";

export function ToastContainer() {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 shadow-lg text-sm font-medium text-white ${
            toast.type === "success" ? "bg-[#238B45]" : "bg-red-600"
          }`}
        >
          <span>{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="shrink-0 text-white/80 hover:text-white text-base leading-none"
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}