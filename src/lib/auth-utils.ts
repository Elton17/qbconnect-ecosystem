/**
 * Password validation and auth error translation (pt-BR)
 */

export const PASSWORD_RULES = {
  minLength: 6,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true,
};

export const PASSWORD_HINT =
  "Mínimo 6 caracteres, com pelo menos: 1 letra maiúscula, 1 minúscula, 1 número e 1 caractere especial (!@#$%&*)";

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_RULES.minLength) {
    return `A senha deve ter pelo menos ${PASSWORD_RULES.minLength} caracteres.`;
  }
  if (PASSWORD_RULES.requireUppercase && !/[A-Z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra maiúscula.";
  }
  if (PASSWORD_RULES.requireLowercase && !/[a-z]/.test(password)) {
    return "A senha deve conter pelo menos uma letra minúscula.";
  }
  if (PASSWORD_RULES.requireNumber && !/[0-9]/.test(password)) {
    return "A senha deve conter pelo menos um número.";
  }
  if (PASSWORD_RULES.requireSpecial && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return "A senha deve conter pelo menos um caractere especial (!@#$%&*).";
  }
  return null;
}

/**
 * Translates common Supabase auth error messages to pt-BR.
 */
export function translateAuthError(message: string): string {
  const map: Record<string, string> = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
    "User already registered": "Este e-mail já está cadastrado.",
    "Signup requires a valid password": "É necessário informar uma senha válida.",
    "Password should be at least 6 characters": "A senha deve ter pelo menos 6 caracteres.",
    "Password should be at least 6 characters.": "A senha deve ter pelo menos 6 caracteres.",
    "Unable to validate email address: invalid format": "Formato de e-mail inválido.",
    "Email rate limit exceeded": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
    "For security purposes, you can only request this once every 60 seconds":
      "Por segurança, aguarde 60 segundos antes de tentar novamente.",
    "New password should be different from the old password.":
      "A nova senha deve ser diferente da senha atual.",
    "New password should be different from the old password":
      "A nova senha deve ser diferente da senha atual.",
    "Auth session missing!": "Sessão expirada. Faça login novamente.",
    "User not found": "Usuário não encontrado.",
    "Token has expired or is invalid": "Link expirado ou inválido. Solicite um novo.",
    "Password is too short": "A senha é muito curta.",
    "Password is known to be weak and easy to guess, please choose a different one.":
      "Esta senha é muito fraca e fácil de adivinhar. Escolha uma diferente.",
  };

  // Exact match
  if (map[message]) return map[message];

  // Partial matches
  for (const [key, value] of Object.entries(map)) {
    if (message.toLowerCase().includes(key.toLowerCase())) return value;
  }

  // Generic fallback patterns
  if (message.toLowerCase().includes("password")) {
    return "Erro relacionado à senha. Verifique os requisitos e tente novamente.";
  }
  if (message.toLowerCase().includes("email")) {
    return "Erro relacionado ao e-mail. Verifique e tente novamente.";
  }
  if (message.toLowerCase().includes("rate limit") || message.toLowerCase().includes("too many")) {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  return message;
}
