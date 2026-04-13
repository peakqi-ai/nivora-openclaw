const steps = [
  { num: "1", title: "上傳", desc: "圖片、3D 檔案或文字描述" },
  { num: "2", title: "客製化", desc: "選擇材質、調整尺寸、即時預覽" },
  { num: "3", title: "下單製造", desc: "確認報價、填寫資料、等待收件" },
];

export default function HowItWorks() {
  return (
    <section className="py-24 bg-[#0d0f13]">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
          三步完成製作
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] flex items-center justify-center text-2xl font-bold text-black mx-auto mb-6">
                {s.num}
              </div>
              <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
