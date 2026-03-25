import axios, { AxiosError } from 'axios';

type LoginRequest = {
  email: string;
  password: string;
};

type TokenResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  accessTokenExpiresInSeconds: number;
  refreshTokenExpiresInSeconds: number;
  role?: string;
  merchantId?: string;
};

const ACCESS_TOKEN_KEY = 'auth:accessToken';
const REFRESH_TOKEN_KEY = 'auth:refreshToken';
const TOKEN_TYPE_KEY = 'auth:tokenType';
const ACCESS_EXPIRES_AT_KEY = 'auth:accessExp';
const REFRESH_EXPIRES_AT_KEY = 'auth:refreshExp';
const MERCHANT_ID_KEY = 'auth:merchantId';
const ROLE_KEY = 'auth:role';
const MERCHANT_NAME_KEY = 'auth:merchantName';

const nowSeconds = () => Math.floor(Date.now() / 1000);

const normalizeTokenResponse = (raw: unknown): TokenResponse => {
  const record = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const accessToken =
    (typeof record.accessToken === 'string' && record.accessToken) ||
    (typeof record.access_token === 'string' && record.access_token) ||
    (typeof record.token === 'string' && record.token) ||
    '';
  const refreshToken =
    (typeof record.refreshToken === 'string' && record.refreshToken) ||
    (typeof record.refresh_token === 'string' && record.refresh_token) ||
    '';
  const tokenType = (typeof record.tokenType === 'string' && record.tokenType) || (typeof record.token_type === 'string' && record.token_type) || 'Bearer';
  const accessTokenExpiresInSeconds = Number(
    record.accessTokenExpiresInSeconds ?? record.access_token_expires_in_seconds ?? record.accessTokenExpiresIn ?? record.expiresIn ?? 0
  );
  const refreshTokenExpiresInSeconds = Number(
    record.refreshTokenExpiresInSeconds ?? record.refresh_token_expires_in_seconds ?? record.refreshTokenExpiresIn ?? 0
  );
  const role = typeof record.role === 'string' ? record.role : typeof record.userRole === 'string' ? record.userRole : undefined;
  const merchantId =
    typeof record.merchantId === 'string'
      ? record.merchantId
      : typeof record.merchant_id === 'string'
        ? record.merchant_id
        : undefined;

  return {
    accessToken,
    refreshToken,
    tokenType,
    accessTokenExpiresInSeconds: Number.isFinite(accessTokenExpiresInSeconds) ? accessTokenExpiresInSeconds : 0,
    refreshTokenExpiresInSeconds: Number.isFinite(refreshTokenExpiresInSeconds) ? refreshTokenExpiresInSeconds : 0,
    role,
    merchantId,
  };
};

const TokenStorage = {
  save(tokens: TokenResponse) {
    if (typeof window === 'undefined') return;
    const accessExp = nowSeconds() + (tokens.accessTokenExpiresInSeconds ?? 0);
    const refreshExp = nowSeconds() + (tokens.refreshTokenExpiresInSeconds ?? 0);
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
    localStorage.setItem(TOKEN_TYPE_KEY, tokens.tokenType ?? 'Bearer');
    localStorage.setItem(ACCESS_EXPIRES_AT_KEY, String(accessExp));
    localStorage.setItem(REFRESH_EXPIRES_AT_KEY, String(refreshExp));
    if (typeof tokens.merchantId === 'string' && tokens.merchantId.trim()) {
      localStorage.setItem(MERCHANT_ID_KEY, tokens.merchantId);
    }
    if (typeof tokens.role === 'string' && tokens.role.trim()) {
      localStorage.setItem(ROLE_KEY, tokens.role);
    }
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_TYPE_KEY);
    localStorage.removeItem(ACCESS_EXPIRES_AT_KEY);
    localStorage.removeItem(REFRESH_EXPIRES_AT_KEY);
    localStorage.removeItem(MERCHANT_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(MERCHANT_NAME_KEY);
  },
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  getTokenType(): string {
    if (typeof window === 'undefined') return 'Bearer';
    return localStorage.getItem(TOKEN_TYPE_KEY) ?? 'Bearer';
  },
  getMerchantId(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(MERCHANT_ID_KEY);
  },
  getRole(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(ROLE_KEY);
  },
  getMerchantName(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(MERCHANT_NAME_KEY);
  },
  isAccessExpired(): boolean {
    if (typeof window === 'undefined') return true;
    const expStr = localStorage.getItem(ACCESS_EXPIRES_AT_KEY);
    if (!expStr) return true;
    const exp = Number(expStr);
    return !Number.isFinite(exp) || nowSeconds() >= exp - 5;
  },
};

const authApi = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

authApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
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

export const AuthService = {
  async login(payload: LoginRequest): Promise<TokenResponse> {
    const bodyJson = { email: payload.email, password: payload.password };

    const response = await authApi.post<unknown>('/api/auth/login', bodyJson, {
      headers: { 'Content-Type': 'application/json' },
    });
    const normalized = normalizeTokenResponse(response.data);
    TokenStorage.save(normalized);
    return normalized;
  },
  async refresh(): Promise<TokenResponse> {
    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('Refresh token ausente');
    }
    const response = await authApi.post<unknown>('/api/auth/refresh', { refreshToken }, {
      headers: { 'Content-Type': 'application/json' },
    });
    const normalized = normalizeTokenResponse(response.data);
    TokenStorage.save(normalized);
    return normalized;
  },
  async me(): Promise<unknown> {
    const token = TokenStorage.getAccessToken();
    const type = TokenStorage.getTokenType();
    const response = await authApi.get('/api/auth/me', {
      headers: token ? { Authorization: `${type} ${token}` } : {},
    });
    return response.data;
  },
  getAccessToken(): string | null {
    return TokenStorage.getAccessToken();
  },
  getTokenType(): string {
    return TokenStorage.getTokenType();
  },
  getMerchantId(): string | null {
    return TokenStorage.getMerchantId();
  },
  getRole(): string | null {
    return TokenStorage.getRole();
  },
  getMerchantName(): string | null {
    return TokenStorage.getMerchantName();
  },
  clear() {
    TokenStorage.clear();
  },
};

export { TokenStorage };
export type { TokenResponse };
