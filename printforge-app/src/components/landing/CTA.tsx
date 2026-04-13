import Link from "next/link";

export default function CTA() {
  return (
    <section className="py-24 bg-[#0d0f13]">
      <div className="max-w-[800px] mx-auto px-8 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-br from-[rgba(0,229,192,0.08)] to-[rgba(123,97,255,0.08)] border border-[var(--glass-border)]">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            準備好將你的創意變成實體了嗎？
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            立即上傳你的圖片或 3D 檔案，30 秒內獲得 3D 模型預覽
          </p>
          <Link
            href="/editor"
            className="inline-block px-8 py-4 text-base rounded-lg bg-[var(--accent)] text-[#060809] font-semibold no-underline hover:opacity-90 transition-opacity"
          >
            免費開始 &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
