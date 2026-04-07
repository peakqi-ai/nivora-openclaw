export const metadata = {
  title: 'PrintForge — AI 驅動的 3D 列印平台',
  description: '上傳圖片，AI 自動生成 3D 模型，選擇材質、即時報價、一鍵下單。',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW">
      <body>{children}</body>
    </html>
  )
}
