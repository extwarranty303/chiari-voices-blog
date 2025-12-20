import React, { useState, useRef, useEffect, Fragment, useId } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

// GlassPanel.tsx
interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
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

// Button.tsx
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'destructive-ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    const variants = {
      primary: "glass-button",
      secondary: "bg-surface/10 hover:bg-surface/20 text-surface border border-surface/20",
      ghost: "hover:bg-surface/10 text-surface",
      outline: "border border-accent text-accent hover:bg-accent hover:text-white",
      destructive: "bg-red-500/90 text-white hover:bg-red-500",
      "destructive-ghost": "text-red-400/70 hover:bg-red-400/10 hover:text-red-400",
    };
    
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2",
      lg: "px-6 py-3 text-lg",
      icon: "h-10 w-10",
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

// Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const internalId = useId();
  const inputId = id || internalId;
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && <label htmlFor={inputId} className="text-sm font-medium text-surface/80">{label}</label>}
      <input 
        id={inputId}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={cn(
          "glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all border border-accent/30", // Added purple border
          error ? "border-red-500 focus:ring-red-500/50" : "",
          className
        )}
        {...props} 
      />
      {error && <span id={`${inputId}-error`} className="text-xs text-red-400" role="alert">{error}</span>}
    </div>
  );
}

// Textarea.tsx
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-surface/80 mb-2">{label}</label>}
      <textarea
        ref={ref}
        className={cn(
            "w-full glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50",
            className
        )}
        {...props}
      />
    </div>
  );
});
Textarea.displayName = 'Textarea';

// Card.tsx
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'dark-glass-card rounded-xl',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-row items-center justify-between space-y-0 p-6 pb-2', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

export const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold tracking-tight text-sm text-surface/80', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// Dropdown.tsx
interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

export function Dropdown({ trigger, children }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const node = useRef<HTMLDivElement>(null);

  const handleClickOutside = (e: MouseEvent) => {
    if (node.current?.contains(e.target as Node)) {
      return;
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={node}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background/80 backdrop-blur-lg rounded-md shadow-lg z-50 border border-surface/10">
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ children }: { children: React.ReactNode }) {
  return (
    <div className="block px-4 py-2 text-sm text-surface hover:bg-accent/20 cursor-pointer">
      {children}
    </div>
  );
}

// Modal.tsx
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel as={GlassPanel} className={cn("w-full max-w-md transform overflow-hidden p-8 text-left align-middle shadow-xl transition-all", className)}>
                <Dialog.Title as="h3" className="text-2xl font-bold leading-6 text-white mb-6 flex justify-between items-center">
                  {title}
                   <button
                    onClick={onClose}
                    className="p-1 rounded-full text-surface/50 hover:bg-surface/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    aria-label="Close modal"
                  >
                    <X size={24} />
                  </button>
                </Dialog.Title>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Select.tsx
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, label, children, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && <label className="block text-sm font-medium text-surface/80 mb-2">{label}</label>}
      <div className="relative">
        <select 
          ref={ref}
          className={cn(
            "w-full appearance-none glass-input rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all border border-accent/30",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-surface/70">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );
});

Select.displayName = 'Select';
