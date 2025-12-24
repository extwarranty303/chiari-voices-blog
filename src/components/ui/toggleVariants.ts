import { cva } from 'class-variance-authority';

export const toggleVariants = cva(
    "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-all hover:bg-surface/10 hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-white",
    {
        variants: {
            variant: {
                default: "bg-transparent text-surface/70",
                outline: "border border-surface/20 bg-transparent hover:bg-surface/10 hover:text-surface",
            },
            size: {
                default: "h-10 w-10 px-0",
                sm: "h-8 w-8 px-0",
                lg: "h-11 w-11 px-0",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);
