import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';

export function AccessDeniedState() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[28rem] items-center justify-center px-4 py-10">
      <div className="max-w-md space-y-4 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">403</p>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">ไม่มีสิทธิ์เข้าถึงหน้านี้</h1>
        <p className="text-sm leading-6 text-muted-foreground">บัญชีของคุณยังไม่มีสิทธิ์สำหรับข้อมูลหรือการทำงานส่วนนี้ หากคิดว่าเป็นข้อผิดพลาด ให้ติดต่อผู้ดูแลพื้นที่ทำงาน</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>ย้อนกลับ</Button>
          <Button type="button" onClick={() => navigate(ROUTES.workspaces)}>เลือกพื้นที่ทำงาน</Button>
        </div>
      </div>
    </div>
  );
}
