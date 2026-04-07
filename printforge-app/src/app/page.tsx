'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/Editor'), { ssr: false })

const stats = [
  { target: 10000, suffix: '+', label: '模型已生成' },
  { target: 98, suffix: '%', label: '客戶滿意度' },
  { target: 48, suffix: 'hr', label: '最快交付' },
  { target: 6, suffix: '+', label: '工業級材質' },
]

const features = [
  {
    icon: '📷',
    title: 'AI 圖像轉 3D',
    desc: '上傳產品照片、設計稿或概念圖，AI 在 30 秒內生成精確的 3D 模型',
  },
  {
    icon: '⚙️',
    title: '工業級材質選擇',
    desc: '支援 PLA、ABS、PolyJet、SLA、SLS、SLM 六種工業級 3D 列印材質',
  },
  {
    icon: '🚀',
    title: '即時報價、快速交付',
    desc: '自動計算材料用量與成本，最快 48 小時完成製造並寄出',
  },
]

const steps = [
  { num: '1', title: '上傳', desc: '圖片、3D 檔案或文字描述' },
  { num: '2', title: '客製化', desc: '選擇材質、調整尺寸、即時預覽' },
  { num: '3', title: '下單製造', desc: '確認報價、填寫資料、等待收件' },
]

const materials = [
  { name: 'PLA', price: 'NT$8/cm³', feature: '經濟實惠', color: '#4CAF50' },
  { name: 'ABS', price: 'NT$10/cm³', feature: '工程塑料', color: '#2196F3' },
  { name: 'PolyJet', price: 'NT$20/cm³', feature: '全彩高精', color: '#FF9800' },
  { name: 'SLA', price: 'NT$16/cm³', feature: '光固化精密', color: '#9C27B0' },
  { name: 'SLS', price: 'NT$24/cm³', feature: '尼龍強韌', color: '#F44336' },
  { name: 'SLM', price: 'NT$64/cm³', feature: '金屬工業', color: '#607D8B' },
]

function useCountUp(target: number, isVisible: boolean, suffix: string) {
  const [count, setCount] = useState(0)
  const animated = useRef(false)

  useEffect(() => {
    if (!isVisible || animated.current) return
    animated.current = true
    const duration = 2000
    const step = target / (duration / 16)
    let current = 0
    const timer = setInterval(() => {
      current += step
      if (current >= target) {
        current = target
        clearInterval(timer)
      }
      setCount(Math.floor(current))
    }, 16)
    return () => clearInterval(timer)
  }, [isVisible, target])

  return `${count.toLocaleString()}${suffix}`
}

function StatItem({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.2 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const display = useCountUp(target, visible, suffix)

  return (
    <div
      ref={ref}
      className="text-center transition-all duration-700"
      style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)' }}
    >
      <div
        className="text-5xl font-black mb-2"
        style={{ background: 'linear-gradient(135deg, #00E5C0, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
      >
        {display}
      </div>
      <div className="text-[#B0B8C1]">{label}</div>
    </div>
  )
}

function ScrollReveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(30px)',
        transition: `all 0.6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

export default function Home() {
  const [editorOpen, setEditorOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return (
    <>
      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          background: scrolled ? 'rgba(10, 12, 15, 0.95)' : 'rgba(10, 12, 15, 0.8)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div
            className="text-2xl font-black"
            style={{ background: 'linear-gradient(135deg, #00E5C0, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
          >
            PrintForge
          </div>
          <ul className="hidden md:flex gap-8 list-none">
            {['功能介紹', '定價方案'].map((label, i) => (
              <li key={i}>
                <a
                  href={`#${['features', 'pricing'][i]}`}
                  className="text-[#B0B8C1] no-underline transition-colors duration-300 hover:text-[#00E5C0]"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button
              className="hidden md:block px-5 py-2.5 rounded-lg border border-white/10 text-white bg-transparent hover:bg-white/5 transition-all duration-300 cursor-pointer font-medium"
            >
              登入
            </button>
            <button
              onClick={() => setEditorOpen(true)}
              className="px-5 py-2.5 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
              style={{ background: '#00E5C0', color: '#0A0C0F', boxShadow: '0 0 0 rgba(0,229,192,0)' }}
              onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,229,192,0.3)')}
              onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,229,192,0)')}
            >
              免費開始
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center pt-28 pb-20 px-6 overflow-hidden"
        style={{ background: '#0A0C0F' }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(0,229,192,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(123,97,255,0.1) 0%, transparent 50%)',
          }}
        />
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="animate-fade-in-up">
            <div
              className="text-sm font-semibold tracking-widest uppercase mb-4"
              style={{ color: '#00E5C0' }}
            >
              AI 驅動的 3D 列印平台
            </div>
            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              從圖片到實體<br />
              只需要
              <span
                style={{ background: 'linear-gradient(135deg, #00E5C0, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                一步
              </span>
            </h1>
            <p className="text-xl text-[#B0B8C1] mb-8 leading-relaxed">
              上傳任何圖片或 3D 檔案，AI 自動生成列印就緒的 3D 模型。<br />
              選擇材質、即時報價、一鍵下單。
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <button
                onClick={() => setEditorOpen(true)}
                className="px-8 py-4 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#00E5C0', color: '#0A0C0F', boxShadow: '0 0 0 rgba(0,229,192,0)' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,229,192,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 0 0 rgba(0,229,192,0)')}
              >
                開始製作 →
              </button>
              <a
                href="#features"
                className="px-8 py-4 text-lg font-medium rounded-xl border border-white/10 text-white hover:bg-white/5 transition-all duration-300 no-underline"
              >
                了解更多
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-[#B0B8C1] text-sm">
              {['AI 即時生成', '6 種工業材質', '48 小時交付', '免費試用'].map(badge => (
                <div key={badge} className="flex items-center gap-1.5">
                  <span style={{ color: '#00E5C0' }}>✓</span>
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Hero visual */}
          <div className="flex justify-center lg:justify-end">
            <div
              className="w-full max-w-md aspect-square rounded-2xl flex items-center justify-center relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: 'radial-gradient(circle at 50% 50%, #00E5C0 0%, transparent 70%)',
                }}
              />
              <div className="text-center relative z-10 animate-float">
                <div className="text-8xl mb-4">🖨️</div>
                <p className="text-[#00E5C0] font-semibold text-lg">AI 3D 生成引擎</p>
                <p className="text-[#B0B8C1] text-sm mt-1">30 秒完成模型生成</p>
              </div>
              {/* Orbit rings */}
              <div
                className="absolute inset-4 rounded-full opacity-20"
                style={{ border: '1px solid #00E5C0', animation: 'spin 8s linear infinite' }}
              />
              <div
                className="absolute inset-8 rounded-full opacity-10"
                style={{ border: '1px solid #7B61FF', animation: 'spin 12s linear infinite reverse' }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="py-20 px-6"
        style={{ background: 'linear-gradient(180deg, transparent, rgba(0,229,192,0.03), transparent)' }}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-10">
          {stats.map(s => (
            <StatItem key={s.label} {...s} />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-center mb-16">一站式 3D 列印解決方案</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <ScrollReveal key={f.title} delay={i * 150}>
                <div
                  className="p-10 rounded-2xl cursor-default transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(-8px)'
                    el.style.borderColor = '#00E5C0'
                    el.style.boxShadow = '0 12px 40px rgba(0,229,192,0.2)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.transform = 'translateY(0)'
                    el.style.borderColor = 'rgba(255,255,255,0.1)'
                    el.style.boxShadow = 'none'
                  }}
                >
                  <div className="text-5xl mb-6">{f.icon}</div>
                  <h3 className="text-2xl font-bold mb-4">{f.title}</h3>
                  <p className="text-[#B0B8C1] leading-relaxed">{f.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-center mb-16">三步完成製作</h2>
          </ScrollReveal>
          <div className="relative flex justify-between items-start">
            {/* Connector line */}
            <div
              className="absolute top-10 hidden md:block"
              style={{
                left: '20%',
                right: '20%',
                height: '2px',
                background: 'linear-gradient(90deg, #00E5C0, #7B61FF)',
                zIndex: 0,
              }}
            />
            {steps.map((step, i) => (
              <ScrollReveal key={step.title} delay={i * 200} className="flex-1 text-center relative z-10">
                <div
                  className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-3xl font-black"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '2px solid #00E5C0',
                    color: '#00E5C0',
                  }}
                >
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold mb-2">{step.title}</h3>
                <p className="text-[#B0B8C1]">{step.desc}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing / Materials */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <h2 className="text-4xl font-black text-center mb-16">材質與定價</h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {materials.map((m, i) => (
              <ScrollReveal key={m.name} delay={i * 100}>
                <div
                  className="p-8 rounded-2xl text-center cursor-pointer transition-all duration-300"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                  onMouseEnter={e => {
                    const el = e.currentTarget
                    el.style.borderColor = '#00E5C0'
                    el.style.transform = 'translateY(-4px)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget
                    el.style.borderColor = 'rgba(255,255,255,0.1)'
                    el.style.transform = 'translateY(0)'
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full mx-auto mb-4"
                    style={{ background: m.color }}
                  />
                  <div className="text-2xl font-bold mb-2">{m.name}</div>
                  <div
                    className="text-3xl font-black mb-2"
                    style={{ color: '#00E5C0' }}
                  >
                    {m.price}
                  </div>
                  <div className="text-[#B0B8C1] mb-6">{m.feature}</div>
                  <button
                    onClick={() => setEditorOpen(true)}
                    className="px-6 py-2.5 rounded-lg font-semibold cursor-pointer transition-all duration-300 hover:-translate-y-0.5"
                    style={{ background: '#00E5C0', color: '#0A0C0F' }}
                  >
                    選擇
                  </button>
                </div>
              </ScrollReveal>
            ))}
          </div>
          <p className="text-center text-[#B0B8C1] text-sm italic">
            實際價格依模型體積與複雜度計算，以上為基礎費率
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <ScrollReveal>
            <div
              className="p-16 rounded-3xl text-center"
              style={{
                backgroundImage: `linear-gradient(#0A0C0F, #0A0C0F), linear-gradient(135deg, #00E5C0, #7B61FF)`,
                backgroundOrigin: 'border-box',
                backgroundClip: 'padding-box, border-box',
                border: '2px solid transparent',
              }}
            >
              <h2 className="text-3xl font-bold mb-4">準備好將你的創意變成實體了嗎？</h2>
              <p className="text-[#B0B8C1] text-xl mb-8">
                立即上傳你的圖片或 3D 檔案，30 秒內獲得 3D 模型預覽
              </p>
              <button
                onClick={() => setEditorOpen(true)}
                className="px-10 py-4 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
                style={{ background: '#00E5C0', color: '#0A0C0F' }}
                onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,229,192,0.4)')}
                onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
              >
                免費開始 →
              </button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            <div>
              <div
                className="text-xl font-bold mb-2"
                style={{ background: 'linear-gradient(135deg, #00E5C0, #7B61FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}
              >
                PrintForge
              </div>
              <p className="text-[#B0B8C1] text-sm">AI 驅動的 3D 列印平台</p>
            </div>
            {[
              { title: '產品', links: ['AI 模型生成', '材質選擇', '即時報價'] },
              { title: '資源', links: ['使用教學', '案例展示', '技術文件'] },
              { title: '公司', links: ['關於我們', '聯絡我們', '隱私政策'] },
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2 list-none">
                  {col.links.map(link => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[#B0B8C1] text-sm no-underline transition-colors duration-300 hover:text-[#00E5C0]"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div
            className="pt-8 border-t border-white/10 text-center text-[#B0B8C1] text-sm space-y-1"
          >
            <p>Powered by Nivora AI × FORMFTY</p>
            <p>© 2026 PrintForge. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* 3D Editor Overlay */}
      {editorOpen && (
        <Editor onClose={() => setEditorOpen(false)} />
      )}
    </>
  )
}
