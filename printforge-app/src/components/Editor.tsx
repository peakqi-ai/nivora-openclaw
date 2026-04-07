'use client'

import { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { Canvas, useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, useGLTF, Environment } from '@react-three/drei'
import * as THREE from 'three'

// ─── Types ───────────────────────────────────────────────────────────────────

interface EditorProps {
  onClose: () => void
}

interface MaterialConfig {
  id: string
  name: string
  sub: string
  color: string
  pricePerCm3: number
  roughness: number
  metalness: number
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MATERIALS: MaterialConfig[] = [
  { id: 'pla',     name: 'PLA',     sub: '經濟實惠',   color: '#4CAF50', pricePerCm3: 8,  roughness: 0.7,  metalness: 0 },
  { id: 'abs',     name: 'ABS',     sub: '工程塑料',   color: '#2196F3', pricePerCm3: 10, roughness: 0.5,  metalness: 0 },
  { id: 'polyjet', name: 'PolyJet', sub: '全彩高精',   color: '#FF9800', pricePerCm3: 20, roughness: 0.1,  metalness: 0 },
  { id: 'sla',     name: 'SLA',     sub: '光固化精密', color: '#9C27B0', pricePerCm3: 16, roughness: 0.15, metalness: 0 },
  { id: 'sls',     name: 'SLS',     sub: '尼龍強韌',   color: '#F44336', pricePerCm3: 24, roughness: 0.6,  metalness: 0 },
  { id: 'slm',     name: 'SLM',     sub: '金屬工業',   color: '#607D8B', pricePerCm3: 64, roughness: 0.2,  metalness: 0.95 },
]

const COLOR_SWATCHES = ['#FFFFFF', '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF']

const PROGRESS_STEPS = [
  '上傳圖片中...',
  'AI 分析圖像...',
  '生成 3D 網格...',
  '套用材質紋理...',
  '模型優化中...',
  '完成！',
]

// ─── 3D Scene Components ──────────────────────────────────────────────────────

function ModelMesh({
  url,
  modelColor,
  roughness,
  metalness,
}: {
  url: string
  modelColor: string
  roughness: number
  metalness: number
}) {
  const { scene } = useGLTF(url)
  const cloned = scene.clone(true)

  cloned.traverse(child => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh
      mesh.material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(modelColor),
        roughness,
        metalness,
      })
    }
  })

  // Center & scale
  const box = new THREE.Box3().setFromObject(cloned)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxDim = Math.max(size.x, size.y, size.z)
  const scale = 3 / maxDim
  cloned.position.sub(center)
  cloned.scale.setScalar(scale)

  return <primitive object={cloned} />
}

function PlaceholderCube({ modelColor, roughness, metalness }: { modelColor: string; roughness: number; metalness: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.rotation.x += delta * 0.2
    }
  })
  return (
    <mesh ref={meshRef}>
      <icosahedronGeometry args={[1.2, 0]} />
      <meshStandardMaterial
        color={modelColor}
        roughness={roughness}
        metalness={metalness}
        emissive={new THREE.Color(modelColor)}
        emissiveIntensity={0.1}
      />
    </mesh>
  )
}

function Scene({
  modelUrl,
  modelColor,
  roughness,
  metalness,
}: {
  modelUrl: string | null
  modelColor: string
  roughness: number
  metalness: number
}) {
  const { gl } = useThree()
  useEffect(() => {
    gl.setPixelRatio(window.devicePixelRatio)
  }, [gl])

  return (
    <>
      <color attach="background" args={['#0A0C0F']} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 7.5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#00E5C0" />
      <Grid
        args={[10, 10]}
        cellColor="#00E5C0"
        sectionColor="#333"
        fadeDistance={20}
        position={[0, -1.5, 0]}
      />
      <Suspense fallback={<PlaceholderCube modelColor={modelColor} roughness={roughness} metalness={metalness} />}>
        {modelUrl ? (
          <ModelMesh url={modelUrl} modelColor={modelColor} roughness={roughness} metalness={metalness} />
        ) : (
          <PlaceholderCube modelColor={modelColor} roughness={roughness} metalness={metalness} />
        )}
      </Suspense>
      <OrbitControls enableDamping dampingFactor={0.05} />
    </>
  )
}

// ─── Order Modal ──────────────────────────────────────────────────────────────

function OrderModal({
  open,
  onClose,
  material,
  color,
  size,
  total,
  sizeDisplay,
}: {
  open: boolean
  onClose: () => void
  material: MaterialConfig
  color: string
  size: number
  total: number
  sizeDisplay: string
}) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', address: '' })
  const [submitted, setSubmitted] = useState(false)
  const orderNumber = useRef(`PF-2026-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`)

  if (!open) return null

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email || !form.address) return
    setSubmitted(true)
  }

  return (
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center p-6"
      style={{ background: 'rgba(0,0,0,0.8)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl p-10"
        style={{ background: '#0A0C0F', border: '1px solid rgba(255,255,255,0.1)' }}
      >
        {!submitted ? (
          <>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">確認訂單</h2>
              <button onClick={onClose} className="text-2xl text-[#B0B8C1] bg-transparent border-none cursor-pointer">×</button>
            </div>

            {/* Summary */}
            <div className="p-6 rounded-xl mb-8" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <h3 className="font-bold mb-4">訂單編號：{orderNumber.current}</h3>
              {[
                ['材質', material.name],
                ['顏色', color],
                ['尺寸', sizeDisplay],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm mb-2">
                  <span className="text-[#B0B8C1]">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between text-xl font-black pt-4 mt-4 border-t border-white/10" style={{ color: '#00E5C0' }}>
                <span>總金額</span>
                <span>NT$ {total.toLocaleString()}</span>
              </div>
            </div>

            {/* Form */}
            {[
              { label: '姓名 *', key: 'name', type: 'text' },
              { label: '電話 *', key: 'phone', type: 'tel' },
              { label: 'Email *', key: 'email', type: 'email' },
              { label: '公司名稱', key: 'company', type: 'text' },
              { label: '配送地址 *', key: 'address', type: 'text' },
            ].map(f => (
              <div key={f.key} className="mb-5">
                <label className="block text-[#B0B8C1] text-sm mb-2">{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg text-white"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                />
              </div>
            ))}

            <button
              onClick={handleSubmit}
              className="w-full py-4 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 mt-2"
              style={{ background: '#00E5C0', color: '#0A0C0F' }}
            >
              確認送出
            </button>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold mb-4">訂單已送出！</h2>
            <p className="text-[#B0B8C1] mb-8 leading-relaxed">
              感謝您的訂購！我們已收到訂單 <strong>{orderNumber.current}</strong><br />
              將於 5-7 個工作天內完成製作並寄出<br />
              您將收到確認信件至 <strong>{form.email}</strong>
            </p>
            <button
              onClick={onClose}
              className="px-8 py-4 text-lg font-semibold rounded-xl cursor-pointer transition-all duration-300"
              style={{ background: '#00E5C0', color: '#0A0C0F' }}
            >
              返回首頁
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Editor Component ────────────────────────────────────────────────────

export default function Editor({ onClose }: EditorProps) {
  const [modelUrl, setModelUrl] = useState<string | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState(MATERIALS[0])
  const [modelColor, setModelColor] = useState('#FFFFFF')
  const [size, setSize] = useState(100)
  const [notes, setNotes] = useState('')
  const [orderOpen, setOrderOpen] = useState(false)

  // Upload / generation state
  const [status, setStatus] = useState<'idle' | 'uploading' | 'processing' | 'done' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('準備中...')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const promptRef = useRef<HTMLInputElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // ── Pricing ────────────────────────────────────────────────────────────────
  const volume = Math.round((size / 10) ** 3)
  const materialCost = Math.round(volume * selectedMaterial.pricePerCm3)
  const processCost = Math.round(materialCost * 0.6)
  const serviceCost = 200
  const total = materialCost + processCost + serviceCost
  const weight = Math.round(volume * 1.2)
  const printTime = Math.round(volume / 10)
  const sizeDisplay = `${size} × ${size} × ${size} mm`

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Progress ───────────────────────────────────────────────────────────────
  const updateProgress = useCallback((pct: number) => {
    setProgress(pct)
    const idx = Math.min(Math.floor(pct / 20), PROGRESS_STEPS.length - 1)
    setProgressLabel(PROGRESS_STEPS[idx])
  }, [])

  // ── Upload Image ───────────────────────────────────────────────────────────
  const uploadImage = useCallback(async (file: File) => {
    setStatus('uploading')
    setProgress(0)
    setProgressLabel('上傳圖片中...')

    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await fetch('/api/generate', { method: 'POST', body: fd })
      const data = await res.json()
      if (!data.task_id) throw new Error(data.error || 'Upload failed')

      setStatus('processing')
      startPolling(data.task_id)
    } catch (err: unknown) {
      setStatus('error')
      showToast('上傳失敗：' + (err instanceof Error ? err.message : '未知錯誤'), 'error')
    }
  }, [showToast])

  // ── Text Generate ──────────────────────────────────────────────────────────
  const generateFromText = useCallback(async () => {
    const prompt = promptRef.current?.value.trim()
    if (!prompt) { showToast('請輸入文字描述', 'error'); return }

    setStatus('uploading')
    setProgress(0)
    setProgressLabel('AI 分析描述...')

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })
      const data = await res.json()
      if (!data.task_id) throw new Error(data.error || 'Generation failed')

      setStatus('processing')
      startPolling(data.task_id)
    } catch (err: unknown) {
      setStatus('error')
      showToast('生成失敗：' + (err instanceof Error ? err.message : '未知錯誤'), 'error')
    }
  }, [showToast])

  // ── Polling ────────────────────────────────────────────────────────────────
  const startPolling = useCallback((taskId: string) => {
    if (pollRef.current) clearInterval(pollRef.current)
    let count = 0

    pollRef.current = setInterval(async () => {
      try {
        count++
        const res = await fetch(`/api/task/${taskId}`)
        const data = await res.json()
        const fakeProgress = Math.min(90, count * 6)
        updateProgress(data.progress ?? fakeProgress)

        if (data.status === 'success' && data.output?.model_url) {
          clearInterval(pollRef.current!)
          updateProgress(100)
          setModelUrl(data.output.model_url)
          setStatus('done')
          showToast('模型載入成功！', 'success')
        } else if (data.status === 'failed') {
          clearInterval(pollRef.current!)
          setStatus('error')
          showToast('模型生成失敗，請重試', 'error')
        }
      } catch {
        // silently retry
      }
    }, 2000)
  }, [updateProgress, showToast])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  // ── STL Export ─────────────────────────────────────────────────────────────
  const exportSTL = () => {
    showToast('請先在場景中生成 3D 模型後再匯出', 'error')
  }

  // ── Drag & Drop ────────────────────────────────────────────────────────────
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.type.startsWith('image/')) uploadImage(file)
  }, [uploadImage])

  const isProcessing = status === 'uploading' || status === 'processing'
  const progressOffset = 283 - (283 * progress) / 100

  return (
    <div className="editor-overlay flex" style={{ zIndex: 2000 }}>

      {/* ── Toolbar ── */}
      <div
        className="flex flex-col items-center gap-3 py-4 w-15"
        style={{ width: 60, background: 'rgba(10,12,15,0.95)', borderRight: '1px solid rgba(255,255,255,0.1)' }}
      >
        {[
          { icon: '←', title: '返回', action: onClose },
          { icon: '⟲', title: '重置視角', action: () => {} },
          { icon: '▦', title: '線框模式', action: () => {} },
          { icon: '📷', title: '截圖', action: () => showToast('截圖功能', 'success') },
        ].map(({ icon, title, action }) => (
          <button
            key={title}
            title={title}
            onClick={action}
            className="w-10 h-10 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 text-lg font-bold border-none"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            onMouseEnter={e => { e.currentTarget.style.background = '#00E5C0'; e.currentTarget.style.color = '#0A0C0F' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white' }}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* ── Main ── */}
      <div className="flex flex-1 min-w-0">

        {/* ── 3D Viewer ── */}
        <div className="flex-1 relative">
          <Canvas
            camera={{ position: [0, 2, 5], fov: 45 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Scene
              modelUrl={modelUrl}
              modelColor={modelColor}
              roughness={selectedMaterial.roughness}
              metalness={selectedMaterial.metalness}
            />
          </Canvas>

          {/* Progress Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10" style={{ background: 'rgba(10,12,15,0.95)' }}>
              <svg className="w-32 h-32 mb-8" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="45" fill="none" strokeWidth="4" stroke="rgba(255,255,255,0.1)" />
                <circle
                  cx="60" cy="60" r="45"
                  fill="none" strokeWidth="4" stroke="#00E5C0"
                  strokeDasharray="283"
                  strokeDashoffset={progressOffset}
                  style={{ transformOrigin: 'center', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 0.3s' }}
                />
                <text x="60" y="65" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold">
                  {Math.round(progress)}%
                </text>
              </svg>
              <p className="text-[#B0B8C1] text-center text-lg">{progressLabel}</p>
            </div>
          )}

          {/* Upload Zone */}
          {status === 'idle' && (
            <div
              className="absolute inset-0 flex items-center justify-center"
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
            >
              <div
                className="max-w-md w-full mx-8 p-12 rounded-2xl text-center cursor-pointer transition-all duration-300"
                style={{
                  border: `2px dashed ${dragging ? '#00E5C0' : 'rgba(255,255,255,0.2)'}`,
                  background: dragging ? 'rgba(0,229,192,0.05)' : 'rgba(10,12,15,0.8)',
                }}
              >
                <div className="text-5xl mb-4">📤</div>
                <p className="text-xl font-medium mb-2">拖曳圖片至此或點擊上傳</p>
                <p className="text-[#B0B8C1] text-sm mb-6">支援 JPG、PNG 圖片格式，或輸入文字描述</p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImage(f) }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 rounded-lg font-semibold cursor-pointer mb-6 w-full"
                  style={{ background: '#00E5C0', color: '#0A0C0F' }}
                >
                  選擇圖片
                </button>

                <div className="text-[#B0B8C1] mb-4 text-sm">— 或 —</div>

                <input
                  ref={promptRef}
                  type="text"
                  placeholder="輸入文字描述，例如：一隻可愛的貓咪"
                  className="w-full px-4 py-3 rounded-lg text-white mb-3"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', outline: 'none' }}
                  onKeyDown={e => { if (e.key === 'Enter') generateFromText() }}
                />
                <button
                  onClick={generateFromText}
                  className="px-6 py-3 rounded-lg font-semibold cursor-pointer w-full transition-all duration-300"
                  style={{ background: 'transparent', border: '1px solid #00E5C0', color: '#00E5C0' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,229,192,0.1)' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                >
                  從文字生成
                </button>
              </div>
            </div>
          )}

          {/* Error retry */}
          {status === 'error' && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <button
                onClick={() => setStatus('idle')}
                className="px-6 py-3 rounded-lg font-semibold cursor-pointer"
                style={{ background: '#00E5C0', color: '#0A0C0F' }}
              >
                重新嘗試
              </button>
            </div>
          )}
        </div>

        {/* ── Right Panel ── */}
        <div
          className="w-80 overflow-y-auto flex flex-col"
          style={{ background: 'rgba(10,12,15,0.95)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
        >
          <div className="flex-1 p-6 space-y-8">

            {/* Material */}
            <div>
              <h3 className="text-base font-bold mb-4">材質選擇</h3>
              <div className="grid grid-cols-2 gap-3">
                {MATERIALS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMaterial(m)}
                    className="p-3 rounded-lg text-center cursor-pointer transition-all duration-300 border-2"
                    style={{
                      background: selectedMaterial.id === m.id ? 'rgba(0,229,192,0.1)' : 'rgba(255,255,255,0.05)',
                      borderColor: selectedMaterial.id === m.id ? '#00E5C0' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <div className="w-3 h-3 rounded-full mx-auto mb-2" style={{ background: m.color }} />
                    <div className="text-sm font-semibold">{m.name}</div>
                    <div className="text-xs text-[#B0B8C1]">{m.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <h3 className="text-base font-bold mb-4">顏色選擇</h3>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {COLOR_SWATCHES.map(c => (
                  <button
                    key={c}
                    onClick={() => setModelColor(c)}
                    className="aspect-square rounded-lg cursor-pointer transition-all duration-300 border-2"
                    style={{
                      background: c,
                      borderColor: modelColor === c ? '#00E5C0' : 'transparent',
                      transform: modelColor === c ? 'scale(1.1)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
              <input
                type="color"
                value={modelColor}
                onChange={e => setModelColor(e.target.value)}
                className="w-full h-10 rounded-lg cursor-pointer border-none"
              />
            </div>

            {/* Size */}
            <div>
              <h3 className="text-base font-bold mb-4">尺寸設定</h3>
              <input
                type="number"
                value={size}
                onChange={e => setSize(Number(e.target.value) || 100)}
                className="w-full px-4 py-3 rounded-lg text-white mb-3"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none' }}
                placeholder="最長邊 (mm)"
              />
              <div className="flex flex-wrap gap-2 mb-3">
                {[50, 100, 150, 200, 300].map(s => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className="px-3 py-1.5 rounded-md text-sm cursor-pointer transition-all duration-300"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#00E5C0' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div
                className="p-3 rounded-lg text-sm text-[#B0B8C1]"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {sizeDisplay}
              </div>
            </div>

            {/* Print Info */}
            <div>
              <h3 className="text-base font-bold mb-4">列印資訊</h3>
              <div className="space-y-2">
                {[
                  ['體積', `${volume} cm³`],
                  ['重量', `${weight} g`],
                  ['預估列印時間', `${printTime} 小時`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-[#B0B8C1]">{k}</span>
                    <span className="font-semibold">{v}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#B0B8C1] mt-2">實際數據以最終模型為準</p>
            </div>

            {/* Notes */}
            <div>
              <h3 className="text-base font-bold mb-4">附加需求</h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="請輸入特殊需求或備註..."
                rows={3}
                className="w-full px-4 py-3 rounded-lg text-white resize-y font-sans"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', outline: 'none', minHeight: 80 }}
              />
            </div>
          </div>

          {/* Quote Panel */}
          <div
            className="p-6 sticky bottom-0"
            style={{ background: 'rgba(10,12,15,0.98)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="space-y-2 mb-4">
              {[
                ['材料費', materialCost],
                ['加工費', processCost],
                ['平台服務費', serviceCost],
              ].map(([label, val]) => (
                <div key={label as string} className="flex justify-between text-sm">
                  <span className="text-[#B0B8C1]">{label}</span>
                  <span>NT$ {(val as number).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between text-2xl font-black mb-1 pt-3 border-t border-white/10" style={{ color: '#00E5C0' }}>
              <span>總計</span>
              <span>NT$ {total.toLocaleString()}</span>
            </div>
            <p className="text-xs text-[#B0B8C1] mb-4">預計交期：5-7 個工作天</p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={exportSTL}
                className="py-3 rounded-lg font-medium cursor-pointer transition-all duration-300 text-sm"
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
              >
                ⬇ 匯出 STL
              </button>
              <button
                onClick={() => {
                  if (!modelUrl && status !== 'done') {
                    showToast('請先生成 3D 模型', 'error')
                    return
                  }
                  setOrderOpen(true)
                }}
                className="py-3 rounded-lg font-semibold cursor-pointer transition-all duration-300 text-sm hover:-translate-y-0.5"
                style={{ background: '#00E5C0', color: '#0A0C0F' }}
              >
                🛒 立即下單
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-8 right-8 px-6 py-4 rounded-lg z-[4000] text-sm font-medium"
          style={{
            background: '#0A0C0F',
            border: `1px solid ${toast.type === 'error' ? '#ff4444' : '#00E5C0'}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          {toast.msg}
        </div>
      )}

      {/* Order Modal */}
      <OrderModal
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        material={selectedMaterial}
        color={modelColor}
        size={size}
        total={total}
        sizeDisplay={sizeDisplay}
      />
    </div>
  )
}
