/**
 * Reads the claims of a JWT without verifying its signature: the backend remains the only judge of validity.
 * The front only uses them to adapt the UI (role, expiry).
 */
export function decodeJwt(token) {
  if (typeof token !== 'string') {
    return null
  }
  const [, payload] = token.split('.')
  if (!payload) {
    return null
  }
  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes))
    return isValidClaims(claims) ? claims : null
  } catch {
    return null
  }
}

export function isExpired(claims, now = Date.now()) {
  return claims.exp * 1000 <= now
}

function isValidClaims(claims) {
  return (
    claims !== null &&
    typeof claims === 'object' &&
    typeof claims.sub === 'string' &&
    typeof claims.role === 'string' &&
    typeof claims.exp === 'number'
  )
}
