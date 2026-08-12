export function formatErrorLog(error: unknown, mode: string): { message: string } {
  if (mode !== 'development') {
    return { message: 'Application error' };
  }

  return {
    message: error instanceof Error && error.message.trim() ? error.message : 'Unknown application error',
  };
}

export function getUserFacingErrorMessage(_error: unknown): string {
  return 'การทำงานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
}
