const features = [
  {
    icon: "📷",
    title: "AI 圖像轉 3D",
    desc: "上傳產品照片、設計稿或概念圖，AI 在 30 秒內生成精確的 3D 模型",
  },
  {
    icon: "⚙️",
    title: "工業級材質選擇",
    desc: "支援 PLA、ABS、PolyJet、SLA、SLS、SLM 六種工業級 3D 列印材質",
  },
  {
    icon: "🚀",
    title: "即時報價、快速交付",
    desc: "自動計算材料用量與成本，最快 48 小時完成製造並寄出",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-[var(--bg-dark)]">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          一站式 3D 列印解決方案
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="p-8 rounded-2xl bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:border-[var(--accent)]/30 transition-colors"
            >
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-3">{f.title}</h3>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
