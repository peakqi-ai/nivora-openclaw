"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center bg-[var(--bg-dark)]">
      <div className="w-full max-w-sm p-8 rounded-2xl bg-[#111318] border border-[var(--glass-border)]">
        <h1 className="text-2xl font-bold text-center mb-2">登入 PrintForge</h1>
        <p className="text-sm text-[var(--text-secondary)] text-center mb-8">
          登入以管理訂單和追蹤進度
        </p>

        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white text-black font-medium cursor-pointer border-none text-sm hover:bg-gray-100 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2a10.3 10.3 0 0 0-.164-1.84H9v3.48h4.844a4.14 4.14 0 0 1-1.796 2.716v2.264h2.908c1.702-1.567 2.684-3.874 2.684-6.62z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.264c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.338A8.997 8.997 0 0 0 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.705A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.705V4.957H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.043l3.007-2.338z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.957L3.964 7.3C4.672 5.17 6.656 3.58 9 3.58z"
            />
          </svg>
          使用 Google 帳號登入
        </button>
      </div>
    </div>
  );
}
