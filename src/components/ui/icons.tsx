import type { ReactNode, SVGProps } from 'react';
import { cn } from '@/lib/cn';

export interface IconProps extends SVGProps<SVGSVGElement> {
  className?: string;
}

function Icon({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4 shrink-0', className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M4 12h16" />
      <path d="M4 18h16" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 7H4c0-1 2-2 2-7Z" />
      <path d="M10 18a2 2 0 0 0 4 0" />
    </Icon>
  );
}

export function ClipboardCheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M9 5.5h6" />
      <path d="M10 3.5h4a2 2 0 0 1 2 2v1H8v-1a2 2 0 0 1 2-2Z" />
      <path d="M7 8h10v11H7Z" />
      <path d="m9 13 1.5 1.5L13.5 11" />
    </Icon>
  );
}

export function ReportIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 20V5" />
      <path d="M5 20h14" />
      <path d="M8 16v-4" />
      <path d="M12 16V8" />
      <path d="M16 16v-6" />
    </Icon>
  );
}

export function WorkspaceIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 8.5V16l8 4 8-4V8.5" />
      <path d="M8 11.5v6" />
      <path d="M16 11.5v6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9 6 6 6-6 6" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function DashboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 13.5 12 4l8 9.5" />
      <path d="M6 12.5V20h12v-7.5" />
      <path d="M9.5 20v-6h5v6" />
    </Icon>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="5.5" />
      <path d="m15 15 4 4" />
    </Icon>
  );
}

export function SiteIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7.5 12 4l8 3.5-8 3.5-8-3.5Z" />
      <path d="M4 7.5V16.5L12 20l8-3.5V7.5" />
      <path d="M12 11v9" />
    </Icon>
  );
}

export function ItemIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="6" width="14" height="12" rx="2" />
      <path d="M8 10h8" />
      <path d="M8 14h5" />
    </Icon>
  );
}

export function ContainerIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 8.5 12 4l8 4.5-8 4.5-8-4.5Z" />
      <path d="M4 8.5V16l8 4 8-4V8.5" />
      <path d="M12 13v7" />
    </Icon>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 21s5-4.7 5-10a5 5 0 1 0-10 0c0 5.3 5 10 5 10Z" />
      <circle cx="12" cy="11" r="2" />
    </Icon>
  );
}

export function MemberIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c1.5-4 4-6 7-6s5.5 2 7 6" />
    </Icon>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="6" width="16" height="12" rx="2" />
      <path d="m5 8 7 5 7-5" />
    </Icon>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19c1.7-3.6 4.4-5.5 6.5-5.5s4.8 1.9 6.5 5.5" />
    </Icon>
  );
}

export function ActivityIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 12h4l2-6 4 12 2-6h4" />
    </Icon>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 8.2a3.8 3.8 0 1 0 0 7.6 3.8 3.8 0 0 0 0-7.6Z" />
      <path d="M19 12a7.2 7.2 0 0 0-.1-1l2-1.4-2-3.5-2.4.8a7.2 7.2 0 0 0-1.7-1L14.4 3h-4.8L9.2 5.9a7.2 7.2 0 0 0-1.7 1L5.1 6.1l-2 3.5 2 1.4a7.2 7.2 0 0 0 0 2l-2 1.4 2 3.5 2.4-.8a7.2 7.2 0 0 0 1.7 1l.4 2.9h4.8l.4-2.9a7.2 7.2 0 0 0 1.7-1l2.4.8 2-3.5-2-1.4c.1-.3.1-.7.1-1Z" />
    </Icon>
  );
}

export function DatabaseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <ellipse cx="12" cy="6.5" rx="7.5" ry="3.5" />
      <path d="M4.5 6.5V12c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5V6.5" />
      <path d="M4.5 12v5.5c0 1.9 3.4 3.5 7.5 3.5s7.5-1.6 7.5-3.5V12" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function FilterIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 6h16" />
      <path d="M7 12h10" />
      <path d="M10 18h4" />
    </Icon>
  );
}

export function OpenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 5H5v14h14v-5" />
      <path d="M14 5h5v5" />
      <path d="M13 11 19 5" />
    </Icon>
  );
}

export function TakeOutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 4v10" />
      <path d="m8 8 4-4 4 4" />
      <path d="M5 20h14" />
    </Icon>
  );
}

export function ReturnIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20V10" />
      <path d="m16 16-4 4-4-4" />
      <path d="M5 4h14" />
    </Icon>
  );
}

export function BorrowIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
      <path d="M5 5v14" />
    </Icon>
  );
}

export function EditIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 20 4.5-1 10-10a1.6 1.6 0 0 0 0-2.3l-1.2-1.2a1.6 1.6 0 0 0-2.3 0l-10 10Z" />
      <path d="M13.5 6.5 17.5 10.5" />
    </Icon>
  );
}

export function LanguageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8" />
      <path d="M4 12h16" />
      <path d="M12 4c2.2 2.1 3.5 4.8 3.5 8s-1.3 5.9-3.5 8c-2.2-2.1-3.5-4.8-3.5-8S9.8 6.1 12 4Z" />
    </Icon>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M10 17.5V19a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-7a1 1 0 0 0-1 1v1.5" />
      <path d="M14 12H4" />
      <path d="m7 9-3 3 3 3" />
    </Icon>
  );
}

export function SunIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 3v2.5" />
      <path d="M12 18.5V21" />
      <path d="M3 12h2.5" />
      <path d="M18.5 12H21" />
      <path d="m5.4 5.4 1.8 1.8" />
      <path d="m16.8 16.8 1.8 1.8" />
      <path d="m18.6 5.4-1.8 1.8" />
      <path d="m7.2 16.8-1.8 1.8" />
    </Icon>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 13.2A7.5 7.5 0 1 1 10.8 4 6.7 6.7 0 0 0 20 13.2Z" />
    </Icon>
  );
}

export function SystemIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4" y="5" width="16" height="11" rx="2" />
      <path d="M9 20h6" />
      <path d="M12 16v4" />
    </Icon>
  );
}
