/**
 * Keep malformed route values away from the invitation API call.
 * The backend remains responsible for token validity and authorization.
 */
export function isUsableInvitationToken(token: string | undefined): token is string {
  if (!token || token.length > 2048) {
    return false;
  }

  return !/[\u0000-\u001f\u007f]/.test(token);
}
