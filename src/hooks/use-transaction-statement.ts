'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TransactionService, type SpringPage, type TransactionStatementItem } from '@/services/transaction-service';

/**
 * Debounce simples para evitar disparar busca no backend a cada tecla digitada.
 *
 * Importante: o requisito pede 500ms.
 */
export function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);

  return debounced;
}

export interface UseTransactionStatementOptions {
  merchantId: string;
  page: number;
  size: number;
  search: string;
  sortField?: 'createdAt' | 'amount';
  sortDirection?: 'asc' | 'desc';
}

/**
 * useTransactionStatement - Hook de dados do Extrato de Transações.
 *
 * Responsabilidades:
 * - Encapsular a chamada do Service.
 * - Gerenciar cache por queryKey (merchantId + page + size + search).
 * - Manter os dados anteriores durante paginação (UX mais suave).
 */
export function useTransactionStatement(options: UseTransactionStatementOptions) {
  const debouncedSearch = useDebouncedValue(options.search, 500);

  const queryKey = useMemo(
    () => [
      'transaction-statement',
      options.merchantId,
      options.page,
      options.size,
      debouncedSearch,
      options.sortField ?? 'createdAt',
      options.sortDirection ?? 'desc',
    ],
    [options.merchantId, options.page, options.size, debouncedSearch, options.sortField, options.sortDirection]
  );

  const query = useQuery<SpringPage<TransactionStatementItem>>({
    queryKey,
    queryFn: () =>
      TransactionService.getStatement(options.merchantId, {
        page: options.page,
        size: options.size,
        search: debouncedSearch,
        sortField: options.sortField,
        sortDirection: options.sortDirection,
      }),
    enabled: !!options.merchantId,
    placeholderData: (previous) => previous,
    staleTime: 10_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    debouncedSearch,
  };
}
