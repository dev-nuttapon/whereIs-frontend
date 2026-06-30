import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  to?: string;
}

export function StatCard({ label, value, description, to }: StatCardProps) {
  const content = (
    <Card className={to ? 'transition-colors hover:border-foreground/15 hover:bg-muted/20' : undefined}>
      <CardContent className="space-y-1.5 p-5 sm:space-y-2 sm:p-6">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl sm:text-3xl">{value}</CardTitle>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </CardContent>
    </Card>
  );

  if (to) {
    return (
      <Link to={to} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
        {content}
      </Link>
    );
  }

  return (
    content
  );
}
