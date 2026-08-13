import type { ReactNode } from 'react';
import { Label } from '@/components/ui/label';

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  optional?: boolean;
  error?: string;
  description?: string;
  children: ReactNode;
}

export function formatFieldLabel(label: string, requirement?: 'required' | 'optional') {
  const cleanLabel = label.replace(/\s*\*\s*$/, '').replace(/\s*\((?:ไม่บังคับ|จำเป็น)\)\s*$/, '').trim();
  if (requirement === 'required') return `${cleanLabel}*`;
  return cleanLabel;
}

export function FormField({ label, htmlFor, required, optional, error, description, children }: FormFieldProps) {
  const inferredRequirement = label.includes('*')
    ? 'required'
    : label.includes('ไม่บังคับ')
      ? 'optional'
      : undefined;
  const requirement = required ? 'required' : optional ? 'optional' : inferredRequirement;
  const displayLabel = formatFieldLabel(label, requirement);

  return (
    <div className="form-field">
      <Label htmlFor={htmlFor}>{displayLabel}</Label>
      {children}
      {description ? <p className="text-xs leading-5 text-muted-foreground">{description}</p> : null}
      {error ? <p className="text-sm leading-5 text-destructive">{error}</p> : null}
    </div>
  );
}
