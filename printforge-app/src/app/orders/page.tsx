"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  material: string;
  color: string;
  size: string;
  totalPrice: number;
  customerName: string;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "待處理", color: "bg-yellow-500" },
  PAID: { label: "已付款", color: "bg-blue-500" },
  PRINTING: { label: "列印中", color: "bg-purple-500" },
  SHIPPED: { label: "已出貨", color: "bg-indigo-500" },
  COMPLETED: { label: "已完成", color: "bg-green-500" },
  CANCELLED: { label: "已取消", color: "bg-red-500" },
};

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/orders")
        .then((r) => r.json())
        .then((data) => {
          setOrders(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center">
        <p className="text-[var(--text-secondary)]">載入中...</p>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[var(--bg-dark)] py-12">
      <div className="max-w-[900px] mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">我的訂單</h1>
          <Link
            href="/editor"
            className="px-5 py-2 text-sm rounded-lg bg-[var(--accent)] text-[#060809] font-medium no-underline hover:opacity-90 transition-opacity"
          >
            + 新訂單
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📦</div>
            <p className="text-[var(--text-secondary)] mb-6">還沒有訂單</p>
            <Link
              href="/editor"
              className="inline-block px-6 py-3 rounded-lg bg-[var(--accent)] text-[#060809] font-medium no-underline"
            >
              開始製作
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const s = STATUS_LABELS[order.status] || STATUS_LABELS.PENDING;
              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block p-5 rounded-xl bg-[#111318] border border-[var(--glass-border)] hover:border-[var(--accent)]/30 transition-colors no-underline text-inherit"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-mono text-sm font-semibold">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`text-xs px-3 py-1 rounded-full text-white ${s.color}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm text-[var(--text-secondary)]">
                    <span>材質：{order.material.toUpperCase()}</span>
                    <span>尺寸：{order.size}</span>
                    <span className="text-[var(--accent)] font-semibold">
                      NT$ {order.totalPrice.toLocaleString()}
                    </span>
                    <span className="ml-auto">
                      {new Date(order.createdAt).toLocaleDateString("zh-TW")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
