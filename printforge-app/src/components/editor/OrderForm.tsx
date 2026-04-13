"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Modal from "@/components/ui/Modal";
import { showToast } from "@/components/ui/Toast";
import { calculatePrice, formatPrice, type MaterialType } from "@/lib/pricing";

interface OrderFormProps {
  open: boolean;
  onClose: () => void;
  material: MaterialType;
  color: string;
  size: number;
  tripoTaskId: string | null;
  modelUrl: string | null;
  sourceUrl: string | null;
  sourceType: "IMAGE" | "TEXT";
  prompt: string | null;
}

export default function OrderForm({
  open,
  onClose,
  material,
  color,
  size,
  tripoTaskId,
  modelUrl,
  sourceUrl,
  sourceType,
  prompt,
}: OrderFormProps) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  const price = calculatePrice(material, size);

  if (!session) {
    return (
      <Modal open={open} onClose={onClose} title="需要登入">
        <p className="text-[var(--text-secondary)] mb-6">
          下單前需要先登入帳號
        </p>
        <button
          onClick={() => signIn("google")}
          className="w-full py-3 rounded-lg bg-[var(--accent)] text-[#060809] font-medium cursor-pointer border-none text-base"
        >
          使用 Google 登入
        </button>
      </Modal>
    );
  }

  async function handleSubmit() {
    if (!form.customerName || !form.phone || !form.email || !form.address) {
      showToast("請填寫所有必填欄位", "error");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          material,
          color,
          size: String(size),
          totalPrice: price.total,
          ...form,
          tripoTaskId,
          modelUrl,
          sourceUrl,
          sourceType,
          prompt,
        }),
      });
      const data = await resp.json();

      if (resp.ok) {
        setSuccess(data.orderNumber);
        showToast("訂單已送出！", "success");
      } else {
        showToast(data.error || "訂單送出失敗", "error");
      }
    } catch {
      showToast("訂單送出失敗", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <Modal open={open} onClose={onClose} title="訂單已送出">
        <div className="text-center py-6">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2">訂單已送出！</h3>
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
            訂單編號：<strong className="text-white">{success}</strong>
            <br />
            將於 5-7 個工作天內完成製作並寄出
            <br />
            確認信已寄至 <strong className="text-white">{form.email}</strong>
          </p>
          <button
            onClick={onClose}
            className="mt-6 px-8 py-3 rounded-lg bg-[var(--accent)] text-[#060809] font-medium cursor-pointer border-none"
          >
            返回
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="確認訂單">
      {/* Order summary */}
      <div className="p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] mb-6 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">材質</span>
          <span>{material.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">顏色</span>
          <span className="flex items-center gap-2">
            {color}
            <span
              className="inline-block w-4 h-4 rounded-full border border-white/20"
              style={{ background: color }}
            />
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">尺寸</span>
          <span>
            {size} &times; {size} &times; {size} mm
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t border-[var(--glass-border)] text-lg font-bold text-[var(--accent)]">
          <span>總金額</span>
          <span>{formatPrice(price.total)}</span>
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-4 mb-6">
        {[
          { key: "customerName", label: "姓名 *", type: "text" },
          { key: "phone", label: "電話 *", type: "tel" },
          { key: "email", label: "Email *", type: "email" },
          { key: "address", label: "配送地址 *", type: "text" },
        ].map((field) => (
          <div key={field.key}>
            <label className="text-sm text-[var(--text-secondary)] block mb-1">
              {field.label}
            </label>
            <input
              type={field.type}
              value={form[field.key as keyof typeof form]}
              onChange={(e) =>
                setForm((f) => ({ ...f, [field.key]: e.target.value }))
              }
              className="w-full p-3 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg text-white text-sm outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="w-full py-4 rounded-lg bg-[var(--accent)] text-[#060809] font-semibold text-base cursor-pointer border-none disabled:opacity-50"
      >
        {submitting ? "送出中..." : "確認送出"}
      </button>
    </Modal>
  );
}
