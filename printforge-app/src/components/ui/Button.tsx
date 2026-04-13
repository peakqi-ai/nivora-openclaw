"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "accent" | "ghost";
type Size = "default" | "large";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
}

export default function Button({
  variant = "accent",
  size = "default",
  href,
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all cursor-pointer text-center no-underline";
  const variants: Record<Variant, string> = {
    accent:
      "bg-[var(--accent)] text-[#060809] hover:opacity-90",
    ghost:
      "bg-transparent text-white border border-[var(--glass-border)] hover:border-white/30 hover:bg-white/5",
  };
  const sizes: Record<Size, string> = {
    default: "px-6 py-3 text-sm",
    large: "px-8 py-4 text-base",
  };

  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>
    );
  }

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
