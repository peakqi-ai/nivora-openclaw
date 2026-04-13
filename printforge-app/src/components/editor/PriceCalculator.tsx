"use client";

import { calculatePrice, formatPrice, type MaterialType } from "@/lib/pricing";

interface PriceCalculatorProps {
  material: MaterialType;
  size: number;
  onOrder: () => void;
  onExportSTL: () => void;
}

export default function PriceCalculator({
  material,
  size,
  onOrder,
  onExportSTL,
}: PriceCalculatorProps) {
  const price = calculatePrice(material, size);

  return (
    <div className="p-4 rounded-xl bg-[rgba(0,229,192,0.05)] border border-[rgba(0,229,192,0.15)]">
      <div className="space-y-2 text-sm mb-3">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">材料費</span>
          <span>{formatPrice(price.materialCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">加工費</span>
          <span>{formatPrice(price.processCost)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">平台服務費</span>
          <span>{formatPrice(price.serviceFee)}</span>
        </div>
      </div>
      <div className="flex justify-between text-lg font-bold pt-3 border-t border-[var(--glass-border)] mb-2">
        <span>總計</span>
        <span className="text-[var(--accent)]">{formatPrice(price.total)}</span>
      </div>
      <div className="text-xs text-[var(--text-secondary)] mb-4">
        預計交期：5-7 個工作天
      </div>
      <div className="flex gap-2">
        <button
          onClick={onExportSTL}
          className="flex-1 py-3 rounded-lg bg-transparent text-white border border-[var(--glass-border)] cursor-pointer text-sm hover:border-white/30 transition-all"
        >
          ⬇ 匯出 STL
        </button>
        <button
          onClick={onOrder}
          className="flex-1 py-3 rounded-lg bg-[var(--accent)] text-[#060809] font-medium cursor-pointer border-none text-sm hover:opacity-90 transition-opacity"
        >
          🛒 立即下單
        </button>
      </div>
    </div>
  );
}
