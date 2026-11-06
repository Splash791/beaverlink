import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

const variants: Record<Variant, string> = {
  primary:
    'bg-osu text-white shadow-sm shadow-osu/30 hover:bg-osu-dark active:translate-y-px',
  secondary:
    'bg-white text-ink border border-stone-300 hover:bg-stone-50 active:translate-y-px',
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-[background-color,transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
