import api from '../lib/api';
import axios from 'axios';

/**
 * Instância pública do Axios (sem interceptor de auth).
 * Usada para rotas que não exigem autenticação, como o Onboarding.
 */
const publicApi = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

publicApi.interceptors.response.use(
  (response) => response,
  (error) => {
    const responseData = error.response?.data;
    const message =
      typeof responseData === 'object' && responseData !== null && typeof responseData.message === 'string'
        ? responseData.message
        : typeof responseData === 'string' && responseData.length < 200 && !responseData.startsWith('<')
          ? responseData
          : error.response?.status
            ? `Erro HTTP ${error.response.status}`
            : 'Falha na requisição. Verifique sua conexão.';
    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

/**
 * Interface que representa os dados de Onboarding enviados ao Backend.
 * Seguindo as regras de negócio de envio apenas de dígitos.
 */
export interface MerchantOnboardingRequest {
  name: string;
  document: string;
  email: string;
  password: string;
  zipCode: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  bankCode: string;
  branch: string;
  account: string;
  accountDigit: string;
  accountType: 'CHECKING' | 'SAVINGS';
}

/**
 * Resposta de sucesso do Backend após o cadastro.
 */
export interface MerchantOnboardingResponse {
  id: string;
  status: 'PENDING_ANALYSIS' | 'ACTIVE' | 'REJECTED';
  created_at: string;
}

/**
 * MerchantService - Camada de Serviço para o Microserviço de Lojistas.
 */
export const MerchantService = {
  /**
   * Realiza o cadastro de um novo lojista (Onboarding).
   * Usa instância pública (sem Authorization header).
   * 
   * @param data - Dados do lojista (limpos de máscaras)
   * @returns Resposta de sucesso da API
   */
  async registerOnboarding(data: MerchantOnboardingRequest): Promise<MerchantOnboardingResponse> {
    const response = await publicApi.post<MerchantOnboardingResponse>('/merchants/onboarding', data);
    return response.data;
  },

  /**
   * Busca dados de precificação de um lojista.
   */
  async getPricing(merchantId: string) {
    const response = await api.get<unknown>(`/merchants/${merchantId}/pricing`);
    return response.data;
  },

  /**
   * Atualiza configurações do lojista (Bandeiras, 2FA, etc).
   */
  async updateConfigs(merchantId: string, configs: Record<string, unknown>) {
    const response = await api.patch<unknown>(`/merchants/${merchantId}/configs`, configs);
    return response.data;
  },

  async getMerchantProfile(merchantId: string): Promise<{ merchantId: string; name: string }> {
    const response = await api.get<unknown>(`/merchants/${merchantId}`);
    const raw = response.data as Record<string, unknown>;
    const id =
      (typeof raw.merchantId === 'string' && raw.merchantId) ||
      (typeof raw.merchant_id === 'string' && raw.merchant_id) ||
      merchantId;
    const name =
      (typeof raw.name === 'string' && raw.name) ||
      (typeof raw.legalName === 'string' && raw.legalName) ||
      (typeof raw.legal_name === 'string' && raw.legal_name) ||
      (typeof raw.businessName === 'string' && raw.businessName) ||
      (typeof raw.business_name === 'string' && raw.business_name) ||
      (typeof raw.tradeName === 'string' && raw.tradeName) ||
      (typeof raw.trade_name === 'string' && raw.trade_name) ||
      '';

    return { merchantId: id, name: String(name) };
  },

  /**
   * Busca o resumo do dashboard para um lojista específico.
   */
  async getDashboardSummary(merchantId: string, period?: string): Promise<DashboardSummaryResponse> {
    const qs = period ? `?period=${period}` : '';
    try {
      const response = await api.get<unknown>(`/dashboard/${merchantId}/summary${qs}`);
      return normalizeDashboardSummary(response.data);
    } catch (err: unknown) {
      const status =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: unknown }).response === 'object' &&
        (err as { response?: { status?: unknown } }).response?.status !== undefined
          ? Number((err as { response: { status: number } }).response.status)
          : null;

      if (status !== 404) throw err;

      const candidates = [
        `/merchants/${merchantId}/dashboard/summary`,
        `/merchants/dashboard/${merchantId}/summary`,
        `/merchants/${merchantId}/summary`,
      ];

      for (const path of candidates) {
        try {
          const response = await api.get<unknown>(`${path}${qs}`);
          return normalizeDashboardSummary(response.data);
        } catch (fallbackErr: unknown) {
          const fallbackStatus =
            typeof fallbackErr === 'object' &&
            fallbackErr !== null &&
            'response' in fallbackErr &&
            typeof (fallbackErr as { response?: unknown }).response === 'object' &&
            (fallbackErr as { response?: { status?: unknown } }).response?.status !== undefined
              ? Number((fallbackErr as { response: { status: number } }).response.status)
              : null;
          if (fallbackStatus === 404) continue;
          throw fallbackErr;
        }
      }

      throw err;
    }
  }
};

const pickFirst = <T>(obj: unknown, keys: string[]): T | undefined => {
  if (typeof obj !== 'object' || obj === null) return undefined;
  const record = obj as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null) return value as T;
  }
  return undefined;
};

const toNumber = (value: unknown): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'string') {
    // Treat R$ or spaces
    let cleanStr = value.replace(/R\$\s?/gi, '').trim();
    // Support Brazilian format "1.500.000,50" -> remove all dots, then replace comma
    if (cleanStr.includes(',') && cleanStr.includes('.')) {
      cleanStr = cleanStr.replace(/\./g, '').replace(',', '.');
    } else if (cleanStr.includes(',')) {
      cleanStr = cleanStr.replace(',', '.');
    }
    const n = Number(cleanStr);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
};

const toString = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
};

const toHourNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    const asNumber = Number(trimmed.replace(',', '.'));
    if (Number.isFinite(asNumber)) return asNumber;

    const match = trimmed.match(/^(\d{1,2})\s*[:h]/i);
    if (match) {
      const h = Number(match[1]);
      return Number.isFinite(h) ? h : fallback;
    }
  }
  return fallback;
};

const normalizeSalesTrend = (raw: unknown): SalesTrendItem[] => {
  const rawTrend =
    pickFirst<unknown>(raw, ['salesTrend', 'sales_trend', 'sales_trends', 'trend']) ??
    pickFirst<unknown>(raw, ['data', 'content']);

  const arr: unknown[] = Array.isArray(rawTrend)
    ? rawTrend
    : typeof rawTrend === 'object' && rawTrend !== null
      ? Object.values(rawTrend as Record<string, unknown>)
      : [];

  return arr
    .map((item, index) => {
      const hourRaw = pickFirst<unknown>(item, ['hour', 'h', 'time', 'label']);
      const hour = toHourNumber(hourRaw, index);

      const today = toNumber(
        pickFirst<unknown>(item, ['today', 'current', 'todayValue', 'today_value', 'todayAmount', 'today_amount'])
      );
      const yesterday = toNumber(
        pickFirst<unknown>(item, ['yesterday', 'previous', 'yesterdayValue', 'yesterday_value', 'yesterdayAmount', 'yesterday_amount'])
      );

      return { hour, today, yesterday };
    })
    .sort((a, b) => a.hour - b.hour);
};

const normalizeBrandDistribution = (raw: unknown): BrandDistributionItem[] => {
  const arr = pickFirst<unknown[]>(raw, ['brandDistribution', 'brand_distribution', 'brands', 'distribution']) ?? [];
  if (!Array.isArray(arr)) return [];

  const mapped = arr.map((item) => {
    const brand = toString(pickFirst<unknown>(item, ['brand', 'flag', 'scheme', 'cardBrand'])).trim();
    const value = toNumber(pickFirst<unknown>(item, ['value', 'amount', 'tpv']));
    const percentage = toNumber(pickFirst<unknown>(item, ['percentage', 'percent', 'share']));
    return { brand, value, percentage };
  });

  const total = mapped.reduce((acc, x) => acc + (Number.isFinite(x.value) ? x.value : 0), 0);

  return mapped.map((x) => ({
    ...x,
    brand: x.brand || '--',
    percentage: x.percentage > 0 ? x.percentage : total > 0 ? (x.value / total) * 100 : 0,
  }));
};

const normalizeDashboardSummary = (raw: unknown): DashboardSummaryResponse => {
  const tpv = toNumber(pickFirst<unknown>(raw, ['totalTpv', 'total_tpv', 'tpv', 'tpv_value']));
  const netRevenue = toNumber(pickFirst<unknown>(raw, [
    'totalNetRevenue', 'total_net_revenue', 'netRevenue', 'net_revenue', 'net', 'netRevenueAmount', 'receitaLiquida'
  ]));
  const approvalRate = toNumber(pickFirst<unknown>(raw, ['approvalRate', 'approval_rate', 'approval', 'taxaAprovacao']));
  const activeTerminals = toNumber(pickFirst<unknown>(raw, ['activeTerminals', 'active_terminals', 'terminaisAtivos']));
  const availableBalance = toNumber(pickFirst<unknown>(raw, ['availableBalance', 'available_balance', 'balance', 'saldoDisponivel']));
  const futureReceivables = toNumber(
    pickFirst<unknown>(raw, ['futureReceivables', 'future_receivables', 'recebiveis', 'pendingReceivables'])
  );
  const averageTicket = toNumber(pickFirst<unknown>(raw, [
    'ticketMedia', 'ticket_media', 'averageTicket', 'average_ticket', 'ticketMedio'
  ]));
  const approvedTransactions = toNumber(pickFirst<unknown>(raw, ['countTransactions', 'count_transactions', 'approvedTransactions', 'approved_transactions', 'approvedCount']));
  const rejectedTransactions = toNumber(pickFirst<unknown>(raw, ['rejectedTransactions', 'rejected_transactions', 'rejectedCount', 'rejected_count']));
  const salesTrend = normalizeSalesTrend(raw);
  const brandDistribution = normalizeBrandDistribution(raw);

  // Extract percentualComparison
  const percentObj = pickFirst<Record<string, unknown>>(raw, ['percentualComparison', 'percentual_comparison']) || {};
  
  // Fallbacks mockados baseados em exigências de UI ("vinda do backend")
  const trendTpvObj = pickFirst<any>(raw, ['trendTpv', 'trend_tpv']);
  const trendTpv = {
    value: percentObj.tpvVariation !== undefined ? Number(percentObj.tpvVariation) : (trendTpvObj?.value ? Number(trendTpvObj.value) : 12.5),
    isPositive: percentObj.tpvVariation !== undefined ? Number(percentObj.tpvVariation) >= 0 : (trendTpvObj?.isPositive !== undefined ? Boolean(trendTpvObj.isPositive) : true),
  };

  const trendNetRevenueObj = pickFirst<any>(raw, ['trendNetRevenue', 'trend_net_revenue']);
  const trendNetRevenue = {
    value: trendNetRevenueObj?.value ? Number(trendNetRevenueObj.value) : 8.2,
    isPositive: trendNetRevenueObj?.isPositive !== undefined ? Boolean(trendNetRevenueObj.isPositive) : true,
  };

  const trendAverageTicketObj = pickFirst<any>(raw, ['trendAverageTicket', 'trend_average_ticket']);
  const trendAverageTicket = {
    value: trendAverageTicketObj?.value ? Number(trendAverageTicketObj.value) : 3.5,
    isPositive: trendAverageTicketObj?.isPositive !== undefined ? Boolean(trendAverageTicketObj.isPositive) : false,
  };

  const historicalAverageTicket = toNumber(pickFirst<unknown>(raw, ['historicalAverageTicket', 'historical_average_ticket'])) || (averageTicket * 1.3);


  return {
    tpv,
    netRevenue,
    approvalRate,
    activeTerminals,
    availableBalance,
    futureReceivables,
    averageTicket,
    approvedTransactions,
    rejectedTransactions,
    trendTpv,
    trendNetRevenue,
    trendAverageTicket,
    historicalAverageTicket,
    salesTrend,
    brandDistribution,
  };
};

/**
 * Interfaces para o Dashboard
 */
export interface DashboardSummaryResponse {
  tpv: number;
  netRevenue: number;
  approvalRate: number;
  activeTerminals: number;
  availableBalance: number;
  futureReceivables: number;
  averageTicket: number;
  approvedTransactions: number;
  rejectedTransactions: number;
  trendTpv: { value: number; isPositive: boolean };
  trendNetRevenue: { value: number; isPositive: boolean };
  trendAverageTicket: { value: number; isPositive: boolean };
  historicalAverageTicket: number;
  salesTrend: SalesTrendItem[];
  brandDistribution: BrandDistributionItem[];
}

export interface SalesTrendItem {
  hour: number;
  today: number;
  yesterday: number;
}

export interface BrandDistributionItem {
  brand: string;
  value: number;
  percentage: number;
}
