"use client";

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
];

interface ColorPickerProps {
  selected: string;
  onSelect: (color: string) => void;
}

export default function ColorPicker({ selected, onSelect }: ColorPickerProps) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-3">顏色選擇</h3>
      <div className="flex gap-2 flex-wrap mb-2">
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => onSelect(c)}
            className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${
              selected === c ? "border-[var(--accent)] scale-110" : "border-transparent"
            }`}
            style={{ background: c }}
          />
        ))}
      </div>
      <input
        type="color"
        value={selected}
        onChange={(e) => onSelect(e.target.value)}
        className="w-full h-10 border-none rounded-lg cursor-pointer"
      />
    </div>
  );
}
