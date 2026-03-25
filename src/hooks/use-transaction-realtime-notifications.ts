'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransactionService } from '@/services/transaction-service';
import { useToast } from '@/hooks/use-toast';
import { useDashboardRevalidator } from '@/hooks/use-dashboard';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

export function useTransactionRealtimeNotifications(merchantId: string) {
  const { toast } = useToast();
  const revalidateDashboard = useDashboardRevalidator();
  const queryClient = useQueryClient();

  const lastSeenTransactionIdRef = useRef<string | null>(null);
  const lastToastAtRef = useRef<number>(0);

  const query = useQuery({
    queryKey: ['transactions-latest', merchantId],
    queryFn: () =>
      TransactionService.getStatement(merchantId, {
        page: 0,
        size: 5,
        sortField: 'createdAt',
        sortDirection: 'desc',
      }),
    enabled: !!merchantId,
    refetchInterval: 5_000,
    staleTime: 0,
    refetchIntervalInBackground: false,
  });

  const latest = useMemo(() => query.data?.content?.[0], [query.data]);

  useEffect(() => {
    if (!latest) return;

    if (!lastSeenTransactionIdRef.current) {
      lastSeenTransactionIdRef.current = latest.id;
      return;
    }

    if (latest.id === lastSeenTransactionIdRef.current) return;

    const now = Date.now();
    if (now - lastToastAtRef.current < 2_000) {
      lastSeenTransactionIdRef.current = latest.id;
      return;
    }

    lastToastAtRef.current = now;
    lastSeenTransactionIdRef.current = latest.id;

    toast({
      title: 'Venda realizada com sucesso!',
      description: `${formatCurrency(latest.amount)}`,
      variant: 'success',
    });

    revalidateDashboard(merchantId);
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['transaction-statement', merchantId] });
    }, 500);
  }, [latest, merchantId, queryClient, revalidateDashboard, toast]);

  return {
    isEnabled: !!merchantId,
    isFetching: query.isFetching,
  };
}
