export function generatePassword(
  length: number,
  includeUppercase?: boolean,
  includeNumbers?: boolean,
  includeSpecialChars?: boolean
) {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()-=_+[]{}|;:,.<>?';

  let validChars = lowercaseChars;

  if (includeUppercase) {
    validChars += uppercaseChars;
  }

  if (includeNumbers) {
    validChars += numberChars;
  }

  if (includeSpecialChars) {
    validChars += specialChars;
  }

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * validChars.length);
    password += validChars.charAt(randomIndex);
  }

  return password;
}
