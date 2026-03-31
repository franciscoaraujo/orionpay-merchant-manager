'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { MerchantService, DashboardSummaryResponse } from '../services/merchant-service';

/**
 * useDashboard - Hook para gerenciar os dados do resumo do Dashboard.
 * 
 * @param merchantId - ID do lojista (pode ser obtido de um contexto de autenticação)
 */
export function useDashboardData(merchantId: string, period?: string) {
  const query = useQuery<DashboardSummaryResponse>({
    queryKey: ['dashboard-summary', merchantId, period],
    queryFn: () => MerchantService.getDashboardSummary(merchantId, period),
    enabled: !!merchantId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}

export function useDashboard(merchantId: string, period?: string) {
  return useDashboardData(merchantId, period);
}

export function useDashboardRevalidator() {
  const queryClient = useQueryClient();

  return (merchantId: string) => {
    if (!merchantId) return;
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary', merchantId] });
    }, 500);
  };
}
