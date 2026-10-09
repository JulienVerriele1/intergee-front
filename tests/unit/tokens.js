/** Builds an unsigned JWT for tests: the front never verifies signatures. */
export function fakeJwt(claims) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString('base64url')
  return `${encode({ alg: 'HS256' })}.${encode(claims)}.signature`
}

export function validToken({ role = 'STUDENT', sub = '0b9c7e4a-1f2d-4c3b-8a5e-6d7f8091a2b3', expiresInSeconds = 3600 } = {}) {
  return fakeJwt({ sub, role, exp: Math.floor(Date.now() / 1000) + expiresInSeconds })
}
