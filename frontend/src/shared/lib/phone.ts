export const PHONE_RE = /^\+998\d{9}$/;

/** +998901234567 -> +998 90 123-45-67 */
export function formatPhone(phone: string): string {
  const m = phone.match(/^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  return m ? `+998 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : phone;
}
