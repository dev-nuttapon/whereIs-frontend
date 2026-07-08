import { Link } from 'react-router-dom';
import { Statistic, Typography } from 'antd';
import { Card, CardContent } from '@/components/ui/card';

export interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  to?: string;
}

export function StatCard({ label, value, description, to }: StatCardProps) {
  const content = (
    <Card className={to ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-32px_rgba(2,6,23,0.55)]' : undefined}>
      <CardContent className="space-y-1.5 p-5 sm:space-y-2 sm:p-6">
        <Typography.Text type="secondary" className="text-sm">
          {label}
        </Typography.Text>
        <Statistic value={value} valueStyle={{ fontSize: '2rem', lineHeight: 1.1 }} />
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
