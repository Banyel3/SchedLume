"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className = "", variant = "primary", size = "md", children, ...props },
    ref
  ) => {
    const baseClasses =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] hover:translate-y-[-0.5px]";

    const variantClasses = {
      primary:
        "bg-primary-400 text-white hover:bg-primary-500 focus:ring-primary-400 shadow-sm hover:shadow",
      secondary:
        "bg-surface-200 text-gray-700 hover:bg-surface-300 focus:ring-gray-400",
      ghost:
        "bg-transparent text-gray-600 hover:bg-surface-200 focus:ring-gray-400",
      danger:
        "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm hover:shadow",
    };

    const sizeClasses = {
      sm: "h-11 px-5 text-sm gap-2 min-w-[48px]",
      md: "h-13 px-6 text-base gap-2 min-w-[48px]",
      lg: "h-15 px-7 text-lg gap-2.5 min-w-[48px]",
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
