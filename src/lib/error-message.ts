const FALLBACK_ERROR_MESSAGE = 'เกิดข้อผิดพลาดที่ไม่คาดคิด';

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return FALLBACK_ERROR_MESSAGE;
}
