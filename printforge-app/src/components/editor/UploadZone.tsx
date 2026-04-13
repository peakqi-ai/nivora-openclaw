"use client";

import { useRef, useState, DragEvent } from "react";

interface UploadZoneProps {
  onImageUpload: (file: File) => void;
  onTextGenerate: (prompt: string) => void;
  visible: boolean;
}

export default function UploadZone({
  onImageUpload,
  onTextGenerate,
  visible,
}: UploadZoneProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [dragOver, setDragOver] = useState(false);

  if (!visible) return null;

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      onImageUpload(file);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  }

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[500px] w-full z-10">
      <div
        className={`p-8 rounded-2xl bg-[var(--glass-bg)] border-2 border-dashed transition-colors text-center ${
          dragOver
            ? "border-[var(--accent)]"
            : "border-[var(--glass-border)]"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="text-5xl mb-4">📤</div>
        <div className="text-lg font-medium mb-2">拖曳圖片至此或點擊上傳</div>
        <div className="text-sm text-[var(--text-secondary)] mb-4">
          支援 JPG, PNG, 或輸入文字描述
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 rounded-lg bg-[var(--accent)] text-[#060809] font-medium cursor-pointer border-none text-sm"
        >
          選擇圖片
        </button>

        <div className="my-4 text-[var(--text-secondary)]">或</div>

        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="輸入文字描述，例如：一隻可愛的貓咪"
          className="w-full p-3 mb-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-white text-sm outline-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && prompt.trim()) onTextGenerate(prompt.trim());
          }}
        />
        <button
          onClick={() => prompt.trim() && onTextGenerate(prompt.trim())}
          className="px-6 py-3 rounded-lg bg-[var(--accent)] text-[#060809] font-medium cursor-pointer border-none text-sm"
        >
          從文字生成
        </button>
      </div>
    </div>
  );
}
