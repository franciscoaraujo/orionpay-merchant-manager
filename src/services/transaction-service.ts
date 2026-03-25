import api from '@/lib/api';

/**
 * Contrato de paginação compatível com Spring Data (Page<T>).
 *
 * Observação: o backend retorna `number` como o índice da página atual (0-based).
 */
export interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
}

/**
 * DTO retornado pelo backend no extrato (camelCase).
 */
export interface TransactionStatementItemDTO {
  id: string;
  nsu: string;
  amount: number;
  createdAt: string;
  brand?: string | null;
  lastFour?: string | null;
  status: string;
  externalId?: string;
  authorizationCode?: string;
  currency?: string;
  productType?: string;
  terminalSerialNumber?: string;
  message?: string;
}

/**
 * Modelo consumido pelo frontend para o extrato.
 * Mantém os nomes camelCase para refletir o contrato do backend.
 */
export interface TransactionStatementItem {
  id: string;
  nsu: string;
  amount: number;
  createdAt: string;
  brand: string | null;
  lastFour: string | null;
  status: string;
  externalId: string;
}

export type TransactionDetailDTO = TransactionStatementItemDTO;
export type TransactionDetail = TransactionStatementItem;

export interface TransactionStatementParams {
  page: number;
  size: number;
  search?: string;
  sortField?: 'createdAt' | 'amount';
  sortDirection?: 'asc' | 'desc';
}

/**
 * TransactionService - Camada de Serviço para o Microserviço de Transações.
 *
 * Encapsula a URL e parâmetros, deixando a UI desacoplada do endpoint final.
 */
export const TransactionService = {
  /**
   * Extrato paginado com busca por NSU.
   *
   * Endpoint: GET /api/v1/transactions/{merchantId}/extrato?page=&size=&search=
   */
  async getStatement(
    merchantId: string,
    params: TransactionStatementParams
  ): Promise<SpringPage<TransactionStatementItem>> {
    const response = await api.get<unknown>(`/transactions/${merchantId}/extrato`, {
      params: {
        page: params.page,
        size: params.size,
        search: params.search?.trim() ? params.search.trim() : undefined,
        sort: params.sortField ? `${params.sortField},${params.sortDirection ?? 'desc'}` : undefined,
      },
    });

    const raw = response.data as Record<string, unknown>;
    const pageObj = (typeof raw.page === 'object' && raw.page !== null ? (raw.page as Record<string, unknown>) : {}) as Record<string, unknown>;
    const contentRaw =
      Array.isArray(raw.content)
        ? (raw.content as TransactionStatementItemDTO[])
        : Array.isArray(raw.items)
          ? (raw.items as TransactionStatementItemDTO[])
          : Array.isArray(raw.data)
            ? (raw.data as TransactionStatementItemDTO[])
            : Array.isArray((pageObj as Record<string, unknown>).content)
              ? ((pageObj as Record<string, unknown>).content as TransactionStatementItemDTO[])
              : [];

    const totalElements =
      typeof raw.totalElements === 'number'
        ? (raw.totalElements as number)
        : typeof pageObj.totalElements === 'number'
          ? (pageObj.totalElements as number)
          : 0;
    const size = typeof params.size === 'number' && params.size > 0 ? params.size : 10;
    let totalPages =
      typeof raw.totalPages === 'number' && (raw.totalPages as number) >= 0
        ? (raw.totalPages as number)
        : typeof pageObj.totalPages === 'number' && (pageObj.totalPages as number) >= 0
          ? (pageObj.totalPages as number)
        : totalElements > 0
          ? Math.ceil(totalElements / size)
          : 0;
    if (totalPages === 0) {
      const anyData =
        (raw as unknown as { number?: number; last?: boolean }) ??
        (pageObj as unknown as { number?: number; last?: boolean });
      const num = typeof anyData?.number === 'number' ? anyData.number : undefined;
      const isLast = typeof anyData?.last === 'boolean' ? anyData.last : undefined;
      if (typeof num === 'number' && typeof isLast === 'boolean') {
        totalPages = isLast ? num + 1 : num + 2;
      }
    }

    return {
      content: contentRaw.map((item) => ({
        id: item.id,
        nsu: item.nsu,
        amount: item.amount,
        createdAt: item.createdAt,
        brand: item.brand ?? null,
        lastFour: item.lastFour ?? null,
        status: item.status,
        externalId: item.externalId ?? item.id,
      })),
      number:
        typeof (raw as { number?: number }).number === 'number'
          ? (raw as { number: number }).number
          : typeof (pageObj as { number?: number }).number === 'number'
            ? (pageObj as { number: number }).number
            : params.page,
      totalElements,
      totalPages,
    };
  },

  async getTransactionDetail(transactionId: string): Promise<TransactionDetail> {
    const response = await api.get<TransactionDetailDTO>(`/transactions/${transactionId}/detail`);
    const item = response.data;
    return {
      id: item.id,
      nsu: item.nsu,
      amount: item.amount,
      createdAt: item.createdAt,
      brand: item.brand ?? null,
      lastFour: item.lastFour ?? null,
      status: item.status,
      externalId: item.externalId ?? item.id,
    };
  },

  async requestRefund(transactionId: string): Promise<void> {
    await api.post(`/transactions/${transactionId}/refund`);
  },

  async sendReceiptEmail(transactionId: string, email: string, merchantId?: string): Promise<number> {
    const response = await api.post(
      `/transactions/${transactionId}/send-email`,
      { email },
      {
        headers: merchantId ? { 'X-Merchant-Id': merchantId } : undefined,
      }
    );
    return response.status;
  },
};
