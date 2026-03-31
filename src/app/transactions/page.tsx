'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { TransactionStatementTable } from '@/components/transactions/TransactionStatementTable';
import { useTransactionStatement } from '@/hooks/use-transaction-statement';
import { useDashboardData } from '@/hooks/use-dashboard';
import { AuthService } from '@/services/auth-service';

export default function TransactionsPage() {
  const initialMerchantId =
    typeof window === 'undefined'
      ? ''
      : AuthService.getMerchantId() ?? '';

  const [merchantId, setMerchantId] = useState(initialMerchantId);
  const [merchantIdResolved, setMerchantIdResolved] = useState(() => {
    if (initialMerchantId) return true;
    if (typeof window === 'undefined') return true;
    return !AuthService.getAccessToken();
  });
  const pageSize = 10;

  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'createdAt' | 'amount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    if (merchantIdResolved) return;

    AuthService.me()
      .then((data) => {
        const id =
          typeof data === 'object' && data !== null
            ? typeof (data as { merchantId?: unknown }).merchantId === 'string'
              ? ((data as { merchantId: string }).merchantId)
              : typeof (data as { merchant_id?: unknown }).merchant_id === 'string'
                ? ((data as { merchant_id: string }).merchant_id)
                : ''
            : '';
        if (id) {
          try {
            localStorage.setItem('auth:merchantId', id);
          } catch {}
          setMerchantId(id);
        }
      })
      .finally(() => setMerchantIdResolved(true));
  }, [merchantIdResolved]);

  const statementQuery = useTransactionStatement({
    merchantId,
    page,
    size: pageSize,
    search,
    sortField,
    sortDirection,
  });

  // Saldo vindo do schema accounting (assumindo que o summary do dashboard expõe availableBalance)
  const dashboardQuery = useDashboardData(merchantId);

  const availableBalance = dashboardQuery.data?.availableBalance ?? 0;
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const transactions = useMemo(() => statementQuery.data?.content ?? [], [statementQuery.data]);
  const totalPages = statementQuery.data?.totalPages ?? 0;

  if (!merchantIdResolved) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-sm font-medium text-slate-500">Carregando...</div>
        </div>
      </MainLayout>
    );
  }

  if (!merchantId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
          <h2 className="text-xl font-bold text-primary tracking-tight">Sessão incompleta</h2>
          <p className="text-muted-foreground text-sm">Não foi possível identificar o merchantId. Faça login novamente.</p>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem('auth:reason', 'unauthenticated');
              } catch {}
              window.location.assign('/?reason=unauthenticated&next=%2Ftransactions');
            }}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-colors"
          >
            Ir para login
          </button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">Extrato de Transações</h2>
            <p className="text-muted-foreground text-sm">Acompanhe e gerencie as operações em tempo real.</p>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Saldo Disponível</span>
            <span className="text-2xl font-bold text-accent tracking-tighter">
              {dashboardQuery.isLoading ? '...' : formatCurrency(availableBalance)}
            </span>
          </div>
        </div>

        {statementQuery.isError && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-sm text-red-700 font-medium">
            Não foi possível carregar as transações. Verifique sua autenticação ou tente novamente.
          </div>
        )}

        <TransactionStatementTable
          transactions={transactions}
          isLoading={statementQuery.isLoading}
          isPaging={statementQuery.isFetching && !statementQuery.isLoading}
          searchValue={search}
          onSearchChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={(nextField) => {
            setPage(0);
            if (nextField === sortField) {
              setSortDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
              return;
            }
            setSortField(nextField);
            setSortDirection('desc');
          }}
          page={page}
          totalPages={totalPages}
          onPrevPage={() => setPage((p) => Math.max(p - 1, 0))}
          onNextPage={() => setPage((p) => (totalPages === 0 ? 0 : Math.min(p + 1, totalPages - 1)))}
        />
      </div>
    </MainLayout>
  );
}
