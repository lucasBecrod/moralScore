"use client";

import { useRef } from "react";

interface ImageUploadProps {
  onFileSelected: (file: File | null) => void;
  previewUrl?: string;
  disabled?: boolean;
}

export function ImageUpload({ onFileSelected, previewUrl, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    onFileSelected(file);
  }

  return (
    <div className="relative">
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      disabled={disabled}
      className="group relative flex h-28 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-zinc-600 bg-zinc-800 transition-colors hover:border-zinc-500 disabled:opacity-50"
    >
      {previewUrl ? (
        <img
          src={previewUrl}
          alt="Preview"
          className="h-full w-full object-cover object-top"
        />
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-8 w-8 text-zinc-500 group-hover:text-zinc-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.118a7.5 7.5 0 0 1 15 0"
          />
        </svg>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        className="hidden"
      />
    </button>
    {previewUrl && (
      <button
        type="button"
        onClick={() => {
          if (inputRef.current) inputRef.current.value = "";
          onFileSelected(null);
        }}
        className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow-md hover:bg-red-500"
      >
        ✕
      </button>
    )}
    </div>
  );
}
