// Simple JWT utility for client-side authentication
// This is a simplified JWT implementation for demo purposes

const SECRET_KEY = "undergrads-secret-key-2024"

interface JWTPayload {
  username: string
  iat: number
  exp: number
}

export function generateToken(username: string): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payload: JWTPayload = {
    username,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  }
  const encodedPayload = btoa(JSON.stringify(payload))

  // Simple signature (not cryptographically secure, for demo only)
  const signature = btoa(SECRET_KEY + header + encodedPayload)

  return `${header}.${encodedPayload}.${signature}`
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))

    // Check expiration
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export function isTokenValid(token: string): boolean {
  return verifyToken(token) !== null
}
