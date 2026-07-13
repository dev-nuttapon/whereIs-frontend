import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  description?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, error, description, children }: FormFieldProps) {
  return (
    <div className="space-y-2.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {description ? <p className="text-xs leading-5 text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-sm leading-5 text-destructive">{error}</p> : null}
    </div>
  );
}
