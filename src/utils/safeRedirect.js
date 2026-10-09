/** Only accepts internal paths, to avoid open redirects through ?redirect=https://evil.example */
export function safeRedirect(target, fallback = '/') {
  if (typeof target !== 'string' || !target.startsWith('/') || target.startsWith('//')) {
    return fallback
  }
  return target
}
