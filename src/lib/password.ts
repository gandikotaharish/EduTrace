/**
 * Password complexity rules: min 8 chars, at least one letter and one number.
 */
export const PASSWORD_RULES = 'At least 8 characters, including one letter and one number.';

export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters.' };
  }
  if (!/[a-zA-Z]/.test(password)) {
    return { valid: false, message: 'Password must include at least one letter.' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must include at least one number.' };
  }
  return { valid: true };
}
