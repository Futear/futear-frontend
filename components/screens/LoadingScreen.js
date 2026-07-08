"use client";

export default function LoadingScreen({ message = "Cargando..." }) {
  return (
    <div className="h-full flex items-center justify-center bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner */}
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />

        {/* Text */}
        <p className="text-lg font-semibold opacity-90">{message}</p>
      </div>
    </div>
  );
}
