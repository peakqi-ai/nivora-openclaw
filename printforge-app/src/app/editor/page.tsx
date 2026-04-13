"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import UploadZone from "@/components/editor/UploadZone";
import ProgressOverlay from "@/components/editor/ProgressOverlay";
import MaterialPicker from "@/components/editor/MaterialPicker";
import ColorPicker from "@/components/editor/ColorPicker";
import SizeSelector from "@/components/editor/SizeSelector";
import PriceCalculator from "@/components/editor/PriceCalculator";
import OrderForm from "@/components/editor/OrderForm";
import { showToast } from "@/components/ui/Toast";
import type { MaterialType } from "@/lib/pricing";

// Dynamic import for Three.js viewer (SSR not supported)
const Viewer3D = dynamic(() => import("@/components/editor/Viewer3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center text-[var(--text-secondary)]">
      載入 3D 檢視器...
    </div>
  ),
});

const PROGRESS_STEPS = [
  "上傳圖片中...",
  "AI 分析圖像...",
  "生成 3D 網格...",
  "套用材質紋理...",
  "模型優化中...",
  "完成！",
];

export default function EditorPage() {
  // Generation state
  const [showUpload, setShowUpload] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState("準備中...");
  const [modelBlobUrl, setModelBlobUrl] = useState<string | null>(null);

  // Model metadata
  const [taskId, setTaskId] = useState<string | null>(null);
  const [remoteModelUrl, setRemoteModelUrl] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"IMAGE" | "TEXT">("IMAGE");
  const [promptText, setPromptText] = useState<string | null>(null);

  // Customization state
  const [material, setMaterial] = useState<MaterialType>("pla");
  const [color, setColor] = useState("#FFFFFF");
  const [size, setSize] = useState(100);

  // Order modal
  const [orderOpen, setOrderOpen] = useState(false);

  const pollTask = useCallback(async (currentTaskId: string) => {
    let pollCount = 0;
    const interval = setInterval(async () => {
      try {
        pollCount++;
        const resp = await fetch(`/api/task/${currentTaskId}`);
        const data = await resp.json();

        const fakeProgress = Math.min(90, pollCount * 6);
        const p = data.progress || fakeProgress;
        setProgress(p);

        const stepIdx = Math.min(
          Math.floor(p / 20),
          PROGRESS_STEPS.length - 1
        );
        setProgressText(PROGRESS_STEPS[stepIdx]);

        if (data.status === "success" && data.output?.model_url) {
          clearInterval(interval);
          setProgress(100);
          setProgressText("完成！");
          await loadModel(data.output.model_url, currentTaskId);
        } else if (data.status === "failed") {
          clearInterval(interval);
          setGenerating(false);
          setShowUpload(true);
          showToast("模型生成失敗，請重試", "error");
        }
      } catch (err) {
        console.error("Poll error:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  async function loadModel(tripoUrl: string, currentTaskId: string) {
    try {
      showToast("正在載入模型...", "info");
      const resp = await fetch("/api/model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: tripoUrl, taskId: currentTaskId }),
      });

      if (!resp.ok) throw new Error("Model fetch failed");

      const blobUrlHeader = resp.headers.get("X-Blob-Url");
      if (blobUrlHeader) setRemoteModelUrl(blobUrlHeader);

      const buffer = await resp.arrayBuffer();
      const blob = new Blob([buffer], { type: "model/gltf-binary" });
      const url = URL.createObjectURL(blob);
      setModelBlobUrl(url);
      setGenerating(false);
      showToast("模型載入成功！", "success");
    } catch (err) {
      console.error("Model load error:", err);
      setGenerating(false);
      setShowUpload(true);
      showToast("模型載入失敗", "error");
    }
  }

  async function handleImageUpload(file: File) {
    setShowUpload(false);
    setGenerating(true);
    setProgress(0);
    setProgressText("上傳圖片中...");
    setSourceType("IMAGE");
    setPromptText(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const resp = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await resp.json();

      if (data.task_id) {
        setTaskId(data.task_id);
        if (data.image_url) setSourceUrl(data.image_url);
        pollTask(data.task_id);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      setGenerating(false);
      setShowUpload(true);
      showToast(
        "上傳失敗：" + (err instanceof Error ? err.message : "Unknown error"),
        "error"
      );
    }
  }

  async function handleTextGenerate(prompt: string) {
    setShowUpload(false);
    setGenerating(true);
    setProgress(0);
    setProgressText("AI 分析描述...");
    setSourceType("TEXT");
    setPromptText(prompt);
    setSourceUrl(null);

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await resp.json();

      if (data.task_id) {
        setTaskId(data.task_id);
        pollTask(data.task_id);
      } else {
        throw new Error(data.error || "Generation failed");
      }
    } catch (err) {
      console.error("Generation error:", err);
      setGenerating(false);
      setShowUpload(true);
      showToast(
        "生成失敗：" + (err instanceof Error ? err.message : "Unknown error"),
        "error"
      );
    }
  }

  function handleExportSTL() {
    showToast("STL 匯出功能開發中", "info");
  }

  return (
    <>
      <div className="flex h-[calc(100vh-72px)]">
        {/* 3D Viewer */}
        <div className="flex-1 relative bg-[var(--bg-dark)]">
          <Viewer3D
            material={material}
            color={color}
            modelBlobUrl={modelBlobUrl}
          />
          <UploadZone
            visible={showUpload}
            onImageUpload={handleImageUpload}
            onTextGenerate={handleTextGenerate}
          />
          <ProgressOverlay
            visible={generating}
            progress={progress}
            text={progressText}
          />
        </div>

        {/* Right panel */}
        <div className="w-[340px] shrink-0 bg-[#111318] border-l border-[var(--glass-border)] overflow-y-auto p-5 space-y-6 hidden md:block">
          <MaterialPicker selected={material} onSelect={setMaterial} />
          <ColorPicker selected={color} onSelect={setColor} />
          <SizeSelector size={size} onSizeChange={setSize} />
          <PriceCalculator
            material={material}
            size={size}
            onOrder={() => setOrderOpen(true)}
            onExportSTL={handleExportSTL}
          />
        </div>
      </div>

      <OrderForm
        open={orderOpen}
        onClose={() => setOrderOpen(false)}
        material={material}
        color={color}
        size={size}
        tripoTaskId={taskId}
        modelUrl={remoteModelUrl}
        sourceUrl={sourceUrl}
        sourceType={sourceType}
        prompt={promptText}
      />
    </>
  );
}
