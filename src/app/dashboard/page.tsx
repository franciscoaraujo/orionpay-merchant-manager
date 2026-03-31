'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import {
  TrendingUp,
  DollarSign,
  Percent,
  CreditCard,
  Wallet,
  Unlock,
  Activity,
  Tag,
  AlertTriangle,
} from 'lucide-react';
import { AnimatePresence, animate, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useDashboardData } from '@/hooks/use-dashboard';
import { KPICard } from '@/components/dashboard/KPICard';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { BrandDistributionList } from '@/components/dashboard/BrandDistributionList';
import { WithdrawModal } from '@/components/dashboard/WithdrawModal';
import { AuthService } from '@/services/auth-service';

export default function DashboardPage() {
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
  const [merchantResolveError, setMerchantResolveError] = useState<string | null>(null);

  useEffect(() => {
    if (merchantIdResolved) return;

    AuthService.me()
      .then((data) => {
        setMerchantResolveError(null);
        const id =
          typeof data === 'object' && data !== null
            ? typeof (data as { merchantId?: unknown }).merchantId === 'string'
              ? (data as { merchantId: string }).merchantId
              : typeof (data as { merchant_id?: unknown }).merchant_id === 'string'
                ? (data as { merchant_id: string }).merchant_id
                : ''
            : '';
        if (id) {
          try {
            localStorage.setItem('auth:merchantId', id);
          } catch {}
          setMerchantId(id);
        }
      })
      .catch((err: unknown) => {
        const message =
          typeof err === 'object' &&
          err !== null &&
          'friendlyMessage' in err &&
          typeof (err as { friendlyMessage?: unknown }).friendlyMessage === 'string'
            ? (err as { friendlyMessage: string }).friendlyMessage
            : 'Não foi possível obter /me.';
        setMerchantResolveError(message);
      })
      .finally(() => setMerchantIdResolved(true));
  }, [merchantIdResolved]);

  const [period, setPeriod] = useState('month');

  const { data, isLoading, isError, isFetching, error } = useDashboardData(merchantId, period);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const useAnimatedNumber = (value: number) => {
    const [displayValue, setDisplayValue] = useState(value);
    const previousValue = useRef(value);

    useEffect(() => {
      const controls = animate(previousValue.current, value, {
        duration: 0.6,
        onUpdate: (v) => setDisplayValue(v),
      });
      previousValue.current = value;
      return () => controls.stop();
    }, [value]);

    return displayValue;
  };

  const animatedBalance = useAnimatedNumber(data?.availableBalance ?? 0);
  const animatedTpv = useAnimatedNumber(data?.tpv ?? 0);
  const animatedFutureReceivables = useAnimatedNumber(data?.futureReceivables ?? 0);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);

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
    const hasAccessToken = typeof window !== 'undefined' ? !!AuthService.getAccessToken() : false;
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Sessão incompleta</h2>
          <p className="text-slate-500 text-sm">Não foi possível identificar o merchantId para carregar o dashboard.</p>
          {merchantResolveError && (
            <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {merchantResolveError}
            </div>
          )}
          <div className="text-[11px] font-medium text-slate-400">accessToken: {hasAccessToken ? 'presente' : 'ausente'}</div>
          <button
            type="button"
            onClick={() => {
              try {
                sessionStorage.setItem('auth:reason', 'unauthenticated');
              } catch {}
              window.location.assign('/?reason=unauthenticated&next=%2Fdashboard');
            }}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Ir para login
          </button>
        </div>
      </MainLayout>
    );
  }

  if (isError) {
    const errorMessage =
      typeof error === 'object' &&
      error !== null &&
      'friendlyMessage' in error &&
      typeof (error as { friendlyMessage?: unknown }).friendlyMessage === 'string'
        ? (error as { friendlyMessage: string }).friendlyMessage
        : 'Erro desconhecido';
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <Activity size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Erro ao carregar dashboard</h2>
          <p className="text-slate-500">Não foi possível carregar os dados do dashboard.</p>
          <div className="text-xs font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
            {errorMessage}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </MainLayout>
    );
  }

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'month', label: 'Mês Atual' },
    { value: 'last_30_days', label: 'Últimos 30 dias' },
  ];

  const periodDescription = 
    period === 'today' ? 'Hoje' :
    period === 'yesterday' ? 'Ontem' :
    period === 'last_30_days' ? 'Últimos 30 dias' :
    'Acumulado do Mês';

  return (
    <MainLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Visão Geral</h1>
            <p className="text-sm text-slate-500">Acompanhe seus resultados e compare os períodos</p>
          </div>
          <div className="flex items-center bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto w-full sm:w-auto">
            {periodOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setPeriod(opt.value)}
                className={cn(
                  "px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 whitespace-nowrap",
                  period === opt.value
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          <KPICard
            title="Saldo Disponível"
            value={
              <AnimatePresence mode="wait">
                <motion.span
                  key={data?.availableBalance ?? 0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {formatCurrency(animatedBalance)}
                </motion.span>
              </AnimatePresence>
            }
            icon={Unlock}
            description="Pronto para saque"
            infoTooltip="O saldo disponível considera vendas de débito pagas em 1 dia útil e crédito em 30 dias."
            action={
              <button
                type="button"
                onClick={() => setIsWithdrawOpen(true)}
                disabled={isLoading || (data?.availableBalance ?? 0) <= 0}
                className="px-4 py-2 rounded-xl border border-input bg-white hover:bg-muted transition-colors text-xs font-bold text-slate-900 disabled:opacity-50"
              >
                Sacar
              </button>
            }
            isLoading={isLoading}
            isRefreshing={isFetching && !isLoading}
          />
          <KPICard
            title="A Receber"
            value={
              <AnimatePresence mode="wait">
                <motion.span
                  key={data?.futureReceivables ?? 0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {formatCurrency(animatedFutureReceivables)}
                </motion.span>
              </AnimatePresence>
            }
            icon={Wallet}
            description="Lançamentos futuros"
            infoTooltip="O saldo a receber torna-se disponível conforme o prazo de liquidação (D+1 para Débito, D+30 para Crédito)."
            containerClassName="bg-slate-50 border-slate-100"
            iconContainerClassName="bg-slate-100"
            iconClassName="text-slate-700"
            isLoading={isLoading}
            isRefreshing={isFetching && !isLoading}
          />
          <KPICard
            title="Volume Total (TPV)"
            value={
              <AnimatePresence mode="wait">
                <motion.span
                  key={data?.tpv ?? 0}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  {formatCurrency(animatedTpv)}
                </motion.span>
              </AnimatePresence>
            }
            icon={DollarSign}
            description={periodDescription}
            trend={data?.trendTpv}
            isLoading={isLoading}
          />
          <KPICard
            title="Receita Líquida"
            value={isLoading ? '...' : formatCurrency(data?.netRevenue || 0)}
            icon={Percent}
            description={periodDescription}
            infoTooltip="Receita real já descontando taxas"
            trend={data?.trendNetRevenue}
            isLoading={isLoading}
          />
          <KPICard
            title="Ticket Médio"
            value={isLoading ? '...' : formatCurrency(data?.averageTicket || 0)}
            icon={Tag}
            description={periodDescription}
            infoTooltip="Valor médio de cada venda aprovada"
            trend={data?.trendAverageTicket}
            containerClassName={
              (data?.averageTicket || 0) > 0 && (data?.averageTicket || 0) <= (data?.historicalAverageTicket || 0) * 0.8
                ? "border-red-200 bg-red-50/20"
                : undefined
            }
            action={
              (data?.averageTicket || 0) > 0 && (data?.averageTicket || 0) <= (data?.historicalAverageTicket || 0) * 0.8 ? (
                <div className="flex flex-col items-end gap-1.5">
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800"
                  )}>
                    -{data?.trendAverageTicket?.value}%
                  </span>
                  <div className="flex items-center gap-1 text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold animate-pulse">
                    <AlertTriangle size={10} />
                     Queda atípica
                  </div>
                </div>
              ) : undefined
            }
            isLoading={isLoading}
          />
          <KPICard
            title="Taxa de Aprovação"
            value={isLoading ? '...' : `${data?.approvalRate || 0}%`}
            icon={(data?.approvalRate ?? 100) < 80 ? AlertTriangle : TrendingUp}
            iconClassName={(data?.approvalRate ?? 100) < 80 ? "text-amber-500" : undefined}
            iconContainerClassName={(data?.approvalRate ?? 100) < 80 ? "bg-amber-50" : undefined}
            description={periodDescription}
            trend={
              (data?.approvalRate ?? 100) < 80 
                ? undefined
                : { value: 2.1, isPositive: true }
            }
            isLoading={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          <div className="lg:col-span-2">
            <SalesChart data={data?.salesTrend || []} isLoading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <BrandDistributionList data={data?.brandDistribution || []} isLoading={isLoading} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 p-6 rounded-[32px] text-white space-y-4 shadow-xl shadow-slate-200">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <CreditCard size={20} className="text-white" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold tracking-tight">Terminais Ativos</h4>
              <p className="text-3xl font-bold">{isLoading ? '...' : data?.activeTerminals}</p>
            </div>
            {data?.activeTerminals === 0 ? (
              <p className="text-xs text-amber-300 font-bold max-w-[200px]">Nenhum terminal operando no momento.</p>
            ) : (
              <p className="text-xs text-white/50 font-medium max-w-[200px]">Todos os seus POS estão operacionais e transmitindo dados.</p>
            )}
          </div>

          <div className="md:col-span-2 bg-white border border-gray-100 p-8 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="space-y-2">
              <h4 className="text-xl font-bold text-slate-900 tracking-tight">Precisa de antecipação?</h4>
              <p className="text-sm text-slate-400 font-medium max-w-md">
                Você tem R$ 45.200,50 disponíveis para antecipar hoje. Receba suas vendas em minutos com as melhores taxas do mercado.
              </p>
            </div>
            <button className="whitespace-nowrap px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:opacity-90 transition-all shadow-lg shadow-slate-200">
              Simular Antecipação
            </button>
          </div>
        </div>
      </div>
      <WithdrawModal
        open={isWithdrawOpen}
        onOpenChange={setIsWithdrawOpen}
        merchantId={merchantId}
        availableBalance={data?.availableBalance ?? 0}
        totalBalance={(data?.availableBalance ?? 0) + (data?.futureReceivables ?? 0)}
      />
    </MainLayout>
  );
}

