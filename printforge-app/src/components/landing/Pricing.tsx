import Link from "next/link";
import { MATERIALS, type MaterialType } from "@/lib/pricing";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-[var(--bg-dark)]">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          材質與定價
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(Object.keys(MATERIALS) as MaterialType[]).map((key) => {
            const m = MATERIALS[key];
            return (
              <div
                key={key}
                className="p-6 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--accent)]/30 transition-colors text-center"
              >
                <div className="text-lg font-bold mb-1">{m.label}</div>
                <div className="text-[var(--accent)] font-semibold text-sm mb-2">
                  NT${m.pricePerCm3}/cm&sup3;
                </div>
                <div className="text-xs text-[var(--text-secondary)] mb-4">
                  {m.description}
                </div>
                <Link
                  href="/editor"
                  className="inline-block text-xs px-4 py-2 rounded-lg bg-[var(--accent)] text-[#060809] font-medium no-underline hover:opacity-90 transition-opacity"
                >
                  選擇
                </Link>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs text-[var(--text-secondary)] mt-6">
          實際價格依模型體積與複雜度計算，以上為基礎費率
        </p>
      </div>
    </section>
  );
}
