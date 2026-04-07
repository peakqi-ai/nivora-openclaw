import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrintForge — AI 驅動的 3D 列印平台',
  description: '上傳任何圖片或 3D 檔案，AI 自動生成列印就緒的 3D 模型。選擇材質、即時報價、一鍵下單。支援 PLA、ABS、PolyJet、SLA、SLS、SLM 六種工業級材質，最快 48 小時完成製造。',
  keywords: ['3D列印', 'AI模型生成', '3D printing', 'PrintForge', 'Nivora AI', 'FORMFTY', '客製化3D列印'],
  authors: [{ name: 'Nivora AI' }],
  openGraph: {
    title: 'PrintForge — AI 驅動的 3D 列印平台',
    description: '從圖片到實體，只需要一步。AI 即時生成 3D 模型，工業級材質，48 小時交付。',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
