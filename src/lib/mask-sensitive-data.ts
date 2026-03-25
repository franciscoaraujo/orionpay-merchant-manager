type JsonValue = null | string | number | boolean | JsonValue[] | { [key: string]: JsonValue };

const SENSITIVE_KEYS = new Set([
  'password',
  'pass',
  'senha',
  'pan',
  'cvv',
  'cvc',
  'securitycode',
  'security_code',
  'tag57',
  'tag_57',
]);

const normalizeKey = (key: string) => key.toLowerCase().replace(/\s+/g, '').replace(/-/g, '_');

const maskValue = (): JsonValue => '***';

export function maskSensitiveData<T>(input: T): T {
  const walk = (value: unknown): unknown => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
    if (Array.isArray(value)) return value.map(walk);
    if (typeof value !== 'object') return value;

    const obj = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [key, v] of Object.entries(obj)) {
      const normalized = normalizeKey(key);
      if (SENSITIVE_KEYS.has(normalized) || normalized.includes('password') || normalized.includes('pan') || normalized.includes('cvv')) {
        out[key] = maskValue();
      } else {
        out[key] = walk(v);
      }
    }
    return out;
  };

  return walk(input) as T;
}
