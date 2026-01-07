import { ArrowUpRight } from "lucide-react";

export default function SupportPopup({ title, children, onClose }) {
  return (
    <div
      className="
        absolute -bottom-6 sm:bottom-0 mb-3 z-50
        right-0 sm:left-0
        max-w-[calc(100vw-1rem)]
        px-2
      "
    >
      <div
        className="
          relative
          w-[260px] max-w-full
          rounded-xl
          p-4
          shadow-2xl
          bg-white/5
          backdrop-blur-md
          border border-white/10
          text-white
          animate-popup
        "
      >
     

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-gray-300 hover:text-white"
        >
          ✕
        </button>

        <h5 className="font-semibold mb-2 text-base">{title}</h5>
        {children}
      </div>
    </div>
  );
}
