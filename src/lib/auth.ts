// ============================================================
// HMAC 서명 세션 토큰 (Web Crypto API — Cloudflare Workers 호환)
// 쿠키: HttpOnly Secure. 회원 30일 / 관리자 24시간
// ============================================================

const enc = new TextEncoder()

async function hmac(secret: string, data: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

// UTF-8 안전 base64url 인코딩/디코딩 (한글 페이로드 지원)
function b64urlEncode(str: string): string {
  const bytes = enc.encode(str)
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlDecode(b64: string): string {
  const padded = b64.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(padded)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

export async function createToken(secret: string, payload: object, maxAgeSec: number): Promise<string> {
  const body = { ...payload, exp: Date.now() + maxAgeSec * 1000 }
  const b64 = b64urlEncode(JSON.stringify(body))
  const sig = await hmac(secret, b64)
  return `${b64}.${sig}`
}

export async function verifyToken(secret: string, token: string): Promise<any | null> {
  if (!token || !token.includes('.')) return null
  const [b64, sig] = token.split('.')
  const expectedSig = await hmac(secret, b64)
  if (sig !== expectedSig) return null
  try {
    const json = JSON.parse(b64urlDecode(b64))
    if (json.exp && json.exp < Date.now()) return null
    return json
  } catch {
    return null
  }
}

export async function hashPassword(password: string, salt: string): Promise<string> {
  const data = enc.encode(password + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
}

export function parseCookie(header: string | null, name: string): string | null {
  if (!header) return null
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'))
  return match ? decodeURIComponent(match[1]) : null
}

export function cookieHeader(name: string, value: string, maxAgeSec: number): string {
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAgeSec}`
}

export function clearCookieHeader(name: string): string {
  return `${name}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`
}

export const SESSION_SECRET_FALLBACK = 'jeongwon-dev-secret-change-in-production'
export const USER_MAXAGE = 30 * 24 * 3600
export const ADMIN_MAXAGE = 24 * 3600
