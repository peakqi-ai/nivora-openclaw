import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center bg-[var(--bg-dark)] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block text-xs font-semibold tracking-wider uppercase text-[var(--accent)] bg-[rgba(0,229,192,0.1)] border border-[rgba(0,229,192,0.25)] rounded-full px-4 py-1.5 mb-6">
            AI 驅動的 3D 列印平台
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
            從圖片到實體
            <br />
            只需要
            <span className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              一步
            </span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] max-w-md mb-10 leading-relaxed">
            上傳任何圖片或 3D 檔案，AI 自動生成列印就緒的 3D
            模型。選擇材質、即時報價、一鍵下單。
          </p>
          <div className="flex gap-4 flex-wrap mb-10">
            <Link
              href="/editor"
              className="px-8 py-4 text-base rounded-lg bg-[var(--accent)] text-[#060809] font-semibold no-underline hover:opacity-90 transition-opacity"
            >
              開始製作 &rarr;
            </Link>
            <a
              href="#features"
              className="px-8 py-4 text-base rounded-lg bg-transparent text-white border border-[var(--glass-border)] no-underline hover:border-white/30 hover:bg-white/5 transition-all"
            >
              了解更多
            </a>
          </div>
          <div className="flex gap-3 flex-wrap">
            {["AI 即時生成", "6 種工業材質", "48 小時交付", "免費試用"].map(
              (t) => (
                <span
                  key={t}
                  className="text-xs text-[var(--text-secondary)] bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full px-3 py-1"
                >
                  {t}
                </span>
              )
            )}
          </div>
        </div>
        <div className="hidden md:flex items-center justify-center">
          <div className="w-80 h-80 rounded-full bg-gradient-to-br from-[rgba(0,229,192,0.15)] to-[rgba(123,97,255,0.1)] flex items-center justify-center text-8xl">
            🧊
          </div>
        </div>
      </div>
    </section>
  );
}
