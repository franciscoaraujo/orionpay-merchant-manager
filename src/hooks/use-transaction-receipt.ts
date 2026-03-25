'use client';

import { useQuery } from '@tanstack/react-query';
import { TransactionService, type TransactionDetail } from '@/services/transaction-service';

export function useTransactionReceipt(transactionId: string) {
  const query = useQuery<TransactionDetail>({
    queryKey: ['transaction-receipt', transactionId],
    queryFn: () => TransactionService.getTransactionDetail(transactionId),
    enabled: !!transactionId,
    staleTime: 10_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

