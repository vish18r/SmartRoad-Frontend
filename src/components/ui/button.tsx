import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "destructive" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-[transform,box-shadow,background-color,color,border-color] duration-[var(--transition-fast)] focus:outline-none focus-visible:shadow-[var(--focus-ring)] disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0";

const sizes: Record<"sm" | "md" | "icon", string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2",
  icon: "h-9 w-9 p-0",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-[image:var(--gradient-primary)] text-white shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  secondary:
    "bg-slate-900 text-white shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  outline:
    "border border-slate-300 text-slate-700 hover:bg-slate-50",
  destructive:
    "bg-[image:var(--gradient-accent)] text-white shadow-[var(--shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-md)]",
  ghost: "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "icon";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading = false, disabled, className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={props.type ?? "button"}
        disabled={disabled || loading}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...props}
      >
        {loading && (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
