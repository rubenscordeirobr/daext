import type { ButtonHTMLAttributes, PropsWithChildren } from "react"

export type ButtonVariant = "primary" | "secondary"

export type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement>
> & {
  variant?: ButtonVariant
}

export function Button({ variant = "primary", children, className = "", ...props }: ButtonProps) {
  const variantClasses: Record<ButtonVariant, string> = {
    primary: "bg-slate-900 text-white hover:bg-slate-800",
    secondary: "bg-white text-slate-900 border border-slate-300 hover:bg-slate-100"
  }

  return (
    <button
      className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition ${variantClasses[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}
