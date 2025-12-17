import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode; // Made children optional
  className?: string;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
  return (
    <div 
      className={cn("glass-panel rounded-xl p-6", className)} 
      {...props}
    >
      {children}
    </div>
  );
}


export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const variants = {
      primary: "glass-button",
      secondary: "bg-surface/10 hover:bg-surface/20 text-surface border border-surface/20",
      ghost: "hover:bg-surface/10 text-surface",
      outline: "border border-accent text-accent hover:bg-accent hover:text-white"
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg"
    };

    return (
      <Comp
        className={cn(
          "rounded-lg font-medium transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id || React.useId();
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-surface/80">{label}</label>}
      <input 
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn("glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all", error ? "border-red-500 focus:ring-red-500/50" : "", className)}
        {...props} 
      />
      {error && <span id={`${inputId}-error`} className="text-xs text-red-400" role="alert">{error}</span>}
    </div>
  );
}

export { Button };
