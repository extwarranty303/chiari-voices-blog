import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, ...props }, ref) => {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-surface/80 mb-2">{label}</label>}
      <textarea
        ref={ref}
        className="w-full glass-input p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50"
        {...props}
      />
    </div>
  );
});
