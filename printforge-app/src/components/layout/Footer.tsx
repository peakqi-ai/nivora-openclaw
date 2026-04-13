import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-dark)]">
      <div className="max-w-[1400px] mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
          <div>
            <div className="text-xl font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] bg-clip-text text-transparent">
              PrintForge
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              AI 驅動的 3D 列印平台
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">產品</h4>
            <ul className="list-none space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link href="/editor" className="hover:text-white no-underline text-inherit transition-colors">AI 模型生成</Link></li>
              <li><Link href="/#pricing" className="hover:text-white no-underline text-inherit transition-colors">材質選擇</Link></li>
              <li><Link href="/#pricing" className="hover:text-white no-underline text-inherit transition-colors">即時報價</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">資源</h4>
            <ul className="list-none space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link href="/#features" className="hover:text-white no-underline text-inherit transition-colors">使用教學</Link></li>
              <li><Link href="/#cases" className="hover:text-white no-underline text-inherit transition-colors">案例展示</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">公司</h4>
            <ul className="list-none space-y-2 text-sm text-[var(--text-secondary)]">
              <li><Link href="#" className="hover:text-white no-underline text-inherit transition-colors">關於我們</Link></li>
              <li><Link href="#" className="hover:text-white no-underline text-inherit transition-colors">聯絡我們</Link></li>
              <li><Link href="#" className="hover:text-white no-underline text-inherit transition-colors">隱私政策</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--glass-border)] pt-6 flex flex-col md:flex-row justify-between text-xs text-[var(--text-secondary)]">
          <p>Powered by Nivora AI &times; FORMFTY</p>
          <p>&copy; {new Date().getFullYear()} PrintForge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
