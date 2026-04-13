"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  material: string;
  color: string;
  size: string;
  totalPrice: number;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  createdAt: string;
  model?: {
    sourceType: string;
    sourceUrl: string | null;
    modelUrl: string | null;
    status: string;
  };
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "待處理",
  PAID: "已付款",
  PRINTING: "列印中",
  SHIPPED: "已出貨",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export default function OrderDetailPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authStatus === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (authStatus === "authenticated" && params.id) {
      fetch(`/api/orders/${params.id}`)
        .then((r) => {
          if (!r.ok) throw new Error("Not found");
          return r.json();
        })
        .then(setOrder)
        .catch(() => router.push("/orders"))
        .finally(() => setLoading(false));
    }
  }, [authStatus, params.id, router]);

  if (authStatus === "loading" || loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">載入中...</p>
      </div>
    );
  }

  if (!session || !order) return null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--bg-dark)] py-12">
      <div className="max-w-[700px] mx-auto px-8">
        <Link
          href="/orders"
          className="text-sm text-[var(--text-secondary)] hover:text-white no-underline mb-6 inline-block"
        >
          &larr; 返回訂單列表
        </Link>

        <div className="p-8 rounded-2xl bg-[#111318] border border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold font-mono">
              {order.orderNumber}
            </h1>
            <span className="text-sm px-4 py-1.5 rounded-full bg-[var(--accent)]/20 text-[var(--accent)]">
              {STATUS_LABELS[order.status] || order.status}
            </span>
          </div>

          <div className="space-y-4 text-sm">
            <h3 className="font-semibold text-base">產品資訊</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[var(--text-secondary)]">材質</span>
                <div className="font-medium mt-1">
                  {order.material.toUpperCase()}
                </div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">顏色</span>
                <div className="font-medium mt-1 flex items-center gap-2">
                  {order.color}
                  <span
                    className="w-4 h-4 rounded-full border border-white/20 inline-block"
                    style={{ background: order.color }}
                  />
                </div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">尺寸</span>
                <div className="font-medium mt-1">{order.size}</div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">金額</span>
                <div className="font-bold text-[var(--accent)] mt-1 text-lg">
                  NT$ {order.totalPrice.toLocaleString()}
                </div>
              </div>
            </div>

            <hr className="border-[var(--glass-border)] my-4" />

            <h3 className="font-semibold text-base">收件資訊</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[var(--text-secondary)]">姓名</span>
                <div className="font-medium mt-1">{order.customerName}</div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">電話</span>
                <div className="font-medium mt-1">{order.phone}</div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">Email</span>
                <div className="font-medium mt-1">{order.email}</div>
              </div>
              <div>
                <span className="text-[var(--text-secondary)]">地址</span>
                <div className="font-medium mt-1">{order.address}</div>
              </div>
            </div>

            <hr className="border-[var(--glass-border)] my-4" />

            <div className="text-xs text-[var(--text-secondary)]">
              建立時間：
              {new Date(order.createdAt).toLocaleString("zh-TW")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
