"use client";

const PRESETS = [50, 100, 150, 200, 300];

interface SizeSelectorProps {
  size: number;
  onSizeChange: (size: number) => void;
}

export default function SizeSelector({ size, onSizeChange }: SizeSelectorProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">尺寸設定</h3>
      <input
        type="number"
        value={size}
        onChange={(e) => onSizeChange(Number(e.target.value) || 50)}
        placeholder="最長邊 (mm)"
        className="w-full p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-white text-sm outline-none mb-2"
      />
      <div className="flex gap-2 mb-3">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => onSizeChange(p)}
            className={`flex-1 py-1.5 text-xs rounded-lg border cursor-pointer transition-all ${
              size === p
                ? "border-[var(--accent)] bg-[rgba(0,229,192,0.1)] text-[var(--accent)]"
                : "border-[var(--glass-border)] bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:border-white/20"
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <div className="text-sm text-[var(--text-secondary)]">
        {size} &times; {size} &times; {size} mm
      </div>
    </div>
  );
}
