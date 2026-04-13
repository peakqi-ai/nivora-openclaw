"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-[1000] backdrop-blur-[20px] bg-[rgba(10,12,15,0.8)] border-b border-[var(--glass-border)]">
      <div className="max-w-[1400px] mx-auto px-8 py-4 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-br from-[var(--accent)] to-[var(--accent-purple)] bg-clip-text text-transparent no-underline"
        >
          PrintForge
        </Link>

        <ul className="hidden md:flex gap-8 list-none">
          <li>
            <Link
              href="/#features"
              className="text-[var(--text-secondary)] hover:text-[var(--accent)] no-underline transition-colors"
            >
              功能介紹
            </Link>
          </li>
          <li>
            <Link
              href="/#pricing"
              className="text-[var(--text-secondary)] hover:text-[var(--accent)] no-underline transition-colors"
            >
              定價方案
            </Link>
          </li>
          {session && (
            <li>
              <Link
                href="/orders"
                className="text-[var(--text-secondary)] hover:text-[var(--accent)] no-underline transition-colors"
              >
                我的訂單
              </Link>
            </li>
          )}
        </ul>

        <div className="flex gap-3 items-center">
          {session ? (
            <>
              <span className="text-sm text-[var(--text-secondary)] hidden sm:inline">
                {session.user?.name}
              </span>
              <button
                onClick={() => signOut()}
                className="px-4 py-2 text-sm rounded-lg bg-transparent text-white border border-[var(--glass-border)] hover:border-white/30 cursor-pointer transition-all"
              >
                登出
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="px-4 py-2 text-sm rounded-lg bg-transparent text-white border border-[var(--glass-border)] hover:border-white/30 cursor-pointer transition-all"
            >
              登入
            </button>
          )}
          <Link
            href="/editor"
            className="px-5 py-2 text-sm rounded-lg bg-[var(--accent)] text-[#060809] font-medium no-underline hover:opacity-90 transition-opacity"
          >
            免費開始
          </Link>
        </div>
      </div>
    </nav>
  );
}
