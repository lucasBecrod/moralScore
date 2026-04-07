const rateLimitMap = new Map<string, number[]>();

export function checkRateLimit(
  ip: string,
  maxRequests = 10,
  windowMs = 60_000,
): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter((ts) => now - ts < windowMs);
  if (recent.length >= maxRequests) return false;
  recent.push(now);
  rateLimitMap.set(ip, recent);
  return true;
}

export function getClientIP(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
