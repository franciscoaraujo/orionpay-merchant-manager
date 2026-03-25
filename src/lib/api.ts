import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import { maskSensitiveData } from '@/lib/mask-sensitive-data';

/**
 * Instância global do Axios configurada para a OrionPay.
 *
 * - baseURL: Definido via variável de ambiente NEXT_PUBLIC_API_URL.
 * - timeout: 10 segundos por padrão.
 * - Interceptor de Request: Adiciona X-Correlation-ID para rastreabilidade.
 * - Interceptor de Response: Padroniza erros vindo do Spring Boot.
 */
const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const ACCESS_TOKEN_KEY = 'auth:accessToken';
const TOKEN_TYPE_KEY = 'auth:tokenType';

function createCorrelationId() {
  try {
    const c = globalThis.crypto as unknown as {
      randomUUID?: () => string;
      getRandomValues?: (arr: Uint8Array) => Uint8Array;
    };
    if (typeof c?.randomUUID === 'function') return c.randomUUID();
    if (typeof c?.getRandomValues === 'function') {
      const bytes = c.getRandomValues(new Uint8Array(16));
      bytes[6] = (bytes[6] & 0x0f) | 0x40;
      bytes[8] = (bytes[8] & 0x3f) | 0x80;
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
      return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`;
    }
  } catch {}
  const rand = () => Math.floor(Math.random() * 0xffffffff).toString(16).padStart(8, '0');
  return `${rand()}-${rand().slice(0, 4)}-4${rand().slice(0, 3)}-a${rand().slice(0, 3)}-${rand()}${rand().slice(0, 4)}`;
}

api.interceptors.request.use((config) => {
  const correlationId = createCorrelationId();
  config.headers['X-Correlation-ID'] = correlationId;
  config.headers['X-Requested-With'] = 'XMLHttpRequest';

  if (typeof window !== 'undefined') {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      const type = localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer';
      if (token && !config.headers['Authorization']) {
        config.headers['Authorization'] = `${type} ${token}`;
      }
    } catch {}
  }

  return config;
});

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;
function flush(token: string | null) {
  void token;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Log de erro centralizado para monitoramento em desenvolvimento
    if (process.env.NODE_ENV === 'development') {
      const payload = maskSensitiveData({
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        request: error.config?.data,
        data: error.response?.data,
      }) as Record<string, unknown>;
      const hasUsefulInfo = Object.values(payload).some((v) => v !== undefined && v !== null);
      if (hasUsefulInfo) {
        console.error('[API Error]:', payload);
      }
    }

    const status = error.response?.status ?? 0;
    const original = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };
    const isAuthCall = (original.url ?? '').includes('/api/auth/');
    const alreadyRetried = original._retry;
    if ((status === 401 || status === 403) && typeof window !== 'undefined' && !isAuthCall) {
      if (alreadyRetried) {
        try {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
        } catch {}
        try {
          sessionStorage.setItem('auth:reason', 'unauthenticated');
        } catch {}
        const atLogin = window.location.pathname === '/' || window.location.pathname.startsWith('/login');
        if (!atLogin) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.assign(`/?next=${next}`);
        }
        return Promise.reject(error);
      }

      original._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = (async () => {
          try {
            const refreshToken = localStorage.getItem('auth:refreshToken');
            if (!refreshToken) throw new Error('No refresh token');
            const res = await fetch('/api/auth/refresh', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
            if (!res.ok) throw new Error('Refresh failed');
            const data = await res.json();
            const newAccess = data?.accessToken as string | undefined;
            const newType = (data?.tokenType as string | undefined) ?? 'Bearer';
            const accessExp = Number(data?.accessTokenExpiresInSeconds ?? 0);
            const refreshExp = Number(data?.refreshTokenExpiresInSeconds ?? 0);
            if (!newAccess) throw new Error('Invalid refresh payload');
            localStorage.setItem(ACCESS_TOKEN_KEY, newAccess);
            localStorage.setItem(TOKEN_TYPE_KEY, newType);
            if (typeof data?.refreshToken === 'string' && data.refreshToken.length > 0) {
              localStorage.setItem('auth:refreshToken', data.refreshToken);
            }
            const nowSec = Math.floor(Date.now() / 1000);
            localStorage.setItem('auth:accessExp', String(nowSec + accessExp));
            localStorage.setItem('auth:refreshExp', String(nowSec + refreshExp));
            flush(newAccess);
            return newAccess;
          } catch {
            try {
              localStorage.removeItem('auth:accessToken');
              localStorage.removeItem('auth:refreshToken');
              localStorage.removeItem('auth:tokenType');
              localStorage.removeItem('auth:accessExp');
              localStorage.removeItem('auth:refreshExp');
            } catch {}
            flush(null);
            return null;
          } finally {
            isRefreshing = false;
            refreshPromise = null;
          }
        })();
      }

      const newToken = await refreshPromise!;
      if (newToken) {
        original.headers = original.headers ?? {};
        const type = localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer';
        (original.headers as Record<string, string>)['Authorization'] = `${type} ${newToken}`;
        return axios(original);
      } else {
        try {
          sessionStorage.setItem('auth:reason', 'unauthenticated');
        } catch {}
        const atLogin = window.location.pathname === '/' || window.location.pathname.startsWith('/login');
        if (!atLogin) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.assign(`/?next=${next}`);
        }
        return Promise.reject(error);
      }
    }

    const responseData = error.response?.data;
    const responseMessage =
      typeof responseData === 'object' &&
      responseData !== null &&
      'message' in responseData &&
      typeof (responseData as { message?: unknown }).message === 'string'
        ? (responseData as { message: string }).message
        : null;

    const responseText =
      typeof responseData === 'string'
        ? responseData.trim().slice(0, 180)
        : null;

    const statusLabel = typeof error.response?.status === 'number' ? `HTTP ${error.response.status}` : null;
    const urlLabel = typeof error.config?.url === 'string' ? error.config.url : null;
    const networkLabel = typeof error.message === 'string' && error.message.trim() ? error.message.trim() : null;

    const message =
      responseMessage ??
      (responseText && !responseText.toLowerCase().startsWith('<!doctype') && !responseText.toLowerCase().startsWith('<html')
        ? responseText
        : null) ??
      (statusLabel && urlLabel ? `${statusLabel} em ${urlLabel}` : null) ??
      (statusLabel ? statusLabel : null) ??
      (networkLabel ? `Falha na requisição: ${networkLabel}` : null) ??
      'Ocorreu um erro inesperado. Tente novamente.';
    
    const apiError = {
      ...error,
      friendlyMessage: message,
    };

    return Promise.reject(apiError);
  }
);

export default api;
