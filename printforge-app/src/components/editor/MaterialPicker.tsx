"use client";

import { MATERIALS, type MaterialType } from "@/lib/pricing";

interface MaterialPickerProps {
  selected: MaterialType;
  onSelect: (material: MaterialType) => void;
}

export default function MaterialPicker({
  selected,
  onSelect,
}: MaterialPickerProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold mb-3">材質選擇</h3>
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(MATERIALS) as MaterialType[]).map((key) => {
          const m = MATERIALS[key];
          const active = selected === key;
          return (
            <button
              key={key}
              onClick={() => onSelect(key)}
              className={`flex items-center gap-2 p-3 rounded-lg border text-left cursor-pointer transition-all text-sm ${
                active
                  ? "border-[var(--accent)] bg-[rgba(0,229,192,0.1)]"
                  : "border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-white/20"
              }`}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ background: m.color }}
              />
              <div>
                <div className="font-medium text-white">{m.label}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {m.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
