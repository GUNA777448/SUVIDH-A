import * as React from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "md" | "lg" | "icon";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-amber-400 text-zinc-950 hover:bg-amber-300 focus-visible:ring-amber-300/60",
  outline:
    "border border-zinc-300 bg-white/70 text-zinc-900 hover:bg-zinc-100/80 focus-visible:ring-zinc-300/50",
  ghost:
    "bg-transparent text-zinc-700 hover:bg-zinc-100/70 focus-visible:ring-zinc-200",
};

const sizeStyles: Record<ButtonSize, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "h-11 w-11",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant = "primary", size = "md", type = "button", ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
          "disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
