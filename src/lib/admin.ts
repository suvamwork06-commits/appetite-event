export const ADMIN_EMAIL = "subhra@appetiteevent.com";

export function isAdminEmail(email: string | null | undefined) {
  return (email ?? "").trim().toLowerCase() === ADMIN_EMAIL;
}
