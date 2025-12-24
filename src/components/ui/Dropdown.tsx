import { useState, createContext, useContext, forwardRef, useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';
import { Slot } from "@radix-ui/react-slot"

const DropdownContext = createContext<{
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
} | null>(null);

const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <DropdownContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left" ref={dropdownRef}>{children}</div>
    </DropdownContext.Provider>
  );
};

const DropdownMenuTrigger = forwardRef<HTMLDivElement, { children: React.ReactNode, asChild?: boolean }>(({ children, asChild, ...props }, ref) => {
    const context = useContext(DropdownContext);
    if (!context) throw new Error('DropdownMenuTrigger must be used within a DropdownMenu');
    const { setIsOpen } = context;

    const Comp = asChild ? Slot : "div";

    return <Comp ref={ref} onClick={() => setIsOpen(prev => !prev)} {...props} className="cursor-pointer">{children}</Comp>;
});
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { align?: 'start' | 'end' }>(({ className, children, align = 'start', ...props }, ref) => {
    const context = useContext(DropdownContext);
    if (!context) throw new Error('DropdownMenuContent must be used within a DropdownMenu');
    const { isOpen } = context;

    if (!isOpen) return null;

    return (
        <div
            ref={ref}
            className={cn(
                'absolute z-50 mt-2 w-56 rounded-md border border-input bg-popover p-1 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
                align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuContent.displayName = 'DropdownMenuContent';

const DropdownMenuItem = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => {
    const context = useContext(DropdownContext);
     const { setIsOpen } = context!;
    return (
        <div
            ref={ref}
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                className
            )}
             onClick={(e) => {
                setIsOpen(false);
                props.onClick?.(e);
            }}
            {...props}
        >
            {children}
        </div>
    );
});
DropdownMenuItem.displayName = 'DropdownMenuItem';

export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem };
