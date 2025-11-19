const buckets = new Map<string, { count: number; first: number }>();

export function checkRateLimit(key: string, limit = 10, windowMs = 60_000) {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { count: 1, first: now });
    return true;
  }
  if (now - bucket.first > windowMs) {
    buckets.set(key, { count: 1, first: now });
    return true;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return false;
  }
  return true;
}

