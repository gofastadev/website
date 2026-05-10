import { type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "default" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantStyles: Record<ButtonVariant, string> = {
  // Dark navy text on Go cyan reaches ~6:1 contrast (passes WCAG AA
  // for normal text and AAA for large/bold). White text on the same
  // bg only hits ~2.3:1 and fails Lighthouse's color-contrast audit.
  // The dark-navy is the gopher's outline color — brand-coherent.
  primary:
    "bg-primary text-[#00283A] dark:text-[#00283A]",
  // Secondary keeps the inverse: outline-only at rest, solid on hover.
  // Same dark-text rule when the cyan fill activates.
  secondary:
    "border border-primary text-primary hover:bg-primary hover:text-[#00283A] dark:hover:text-[#00283A]",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "px-4 py-2 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded-lg font-semibold transition-[background-color]",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
