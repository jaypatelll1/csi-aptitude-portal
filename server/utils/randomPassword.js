function generateRandomPassword(length = 12, useSpecialChars = true) {
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  if (useSpecialChars) chars += '!@#$%^&*()_+';

  return Array.from(
    { length },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

module.exports = { generateRandomPassword };