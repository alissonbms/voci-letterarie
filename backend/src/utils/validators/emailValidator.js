const emailRegex =
  /^[a-zA-Z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isEmailValid(email) {
  if (!email || email.length > 254) return false;
  if (!emailRegex.test(email)) return false;

  const [localPart, domain] = email.split("@");

  // O nome do usuário (localPart) deve ter no máximo 64 caracteres
  if (localPart.length > 64) return false;

  // O domínio não pode começar ou terminar com um ponto ou hífen
  if (
    domain.startsWith(".") ||
    domain.endsWith(".") ||
    domain.startsWith("-") ||
    domain.endsWith("-")
  )
    return false;

  const domainParts = domain.split(".");

  // Cada parte do domínio deve ter no máximo 63 caracteres e conter pelo menos uma letra
  if (domainParts.some((part) => part.length > 63 || !/[a-zA-Z]/.test(part)))
    return false;

  return true;
}

export default isEmailValid;
