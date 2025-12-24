import { cn } from '../../lib/utils';

export const GlassPanel = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <div className={cn(
            'bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg shadow-lg p-6',
            className
        )}>
            {children}
        </div>
    );
};