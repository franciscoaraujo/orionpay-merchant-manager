'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { AuthService } from '@/services/auth-service';
import { Settlement } from '@/types';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Zap, 
  Info, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Calendar,
  DollarSign,
  PieChart as PieChartIcon,
  Check,
  Percent,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  ArrowUpRight,
  Loader2,
  Lock,
  MessageSquare,
  X,
  Sparkles,
  Clock,
  ArrowRightCircle,
  HelpCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AnticipationPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const merchantId = AuthService.getMerchantId();
  const anticipationRateMonthly = 2.49;

  const { data: anticipationData, isLoading, error: queryError } = useQuery({
    queryKey: ['available-for-anticipation', merchantId],
    queryFn: async () => {
      if (!merchantId) return { items: [] };
      const response = await api.get(`/merchants/${merchantId}/anticipation/available`);
      return response.data;
    },
    enabled: !!merchantId && isMounted,
    retry: false
  });

  // Mapeamento seguro baseado na estrutura da API: { totalGrossToAnticipate, totalCost, totalNetToReceive, items: [] }
  const availableSettlements = useMemo(() => {
    const rawItems = anticipationData?.items || [];
    return rawItems.map((item: any) => {
      const id = item.settlementId || Math.random().toString(36).substring(7);
      return {
        id: id.toString(),
        transaction_id: id.toString(),
        settlement_date: item.originalSettlementDate || new Date().toISOString(),
        amount_gross: Number(item.grossAmount || 0),
        amount_net: Number(item.netAmount || 0),
        fee_anticipation: Number(item.anticipationCost || 0),
        days_to_anticipate: Number(item.daysToAnticipate || 0),
        status: 'SCHEDULED'
      };
    }) as (Settlement & { fee_anticipation: number, days_to_anticipate: number })[];
  }, [anticipationData]);

  const { data: merchantData } = useQuery({
    queryKey: ['merchant-profile', merchantId],
    queryFn: async () => {
      if (!merchantId) return null;
      const response = await api.get(`/merchants/${merchantId}`);
      return response.data;
    },
    enabled: !!merchantId && isMounted,
  });

  const isNoRateError = useMemo(() => {
    const errorData = (queryError as any)?.response?.data;
    return errorData?.status === 400 && errorData?.message?.includes('taxa de antecipação configurada');
  }, [queryError]);

  const toggleSelect = (id: string) => {
    if (!id) return;
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const simulation = useMemo(() => {
    const selectedItems = availableSettlements.filter(s => selectedIds.has(s.id));
    const gross = selectedItems.reduce((acc, curr) => acc + (curr.amount_gross || 0), 0);
    // Na antecipação, o custo já vem calculado individualmente por item (anticipationCost)
    // O MDR (taxas contratuais) já foi descontado no netAmount vindo da API? 
    // Com base no JSON, o grossAmount é o valor total e o netAmount é o valor final pós todas as taxas.
    const net = selectedItems.reduce((acc, curr) => acc + (curr.amount_net || 0), 0);
    const anticipationFee = selectedItems.reduce((acc, curr) => acc + (curr.fee_anticipation || 0), 0);
    const mdr = gross - net - anticipationFee;

    return { gross, mdr, anticipationFee, net, count: selectedItems.length };
  }, [selectedIds, availableSettlements]);

  const formatCurrency = (value: number) => {
    const safeValue = isNaN(value) ? 0 : value;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeValue);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      if (isValid(date)) return format(date, 'dd/MM/yyyy');
      return '--/--/----';
    } catch {
      return '--/--/----';
    }
  };

  const handleSupportClick = () => {
    const merchantDisplayName = merchantData?.name || merchantData?.fancyName || 'Não identificado';
    const params = new URLSearchParams({
      openTicket: 'true',
      category: 'taxas',
      subject: 'Configuração de Taxa de Antecipação',
      message: `Gostaria de solicitar a configuração da minha taxa de antecipação. (Lojista: ${merchantDisplayName} | ID: ${merchantId})`
    });
    router.push(`/support?${params.toString()}`);
  };

  if (!isMounted) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <Loader2 className="animate-spin text-[#0A2540] w-10 h-10" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-border shadow-sm">
          <div className="space-y-1 text-left">
            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
              <Zap size={22} className="text-[#0A2540] fill-[#0A2540]/10" />
              Antecipação de Recebíveis
            </h2>
            <p className="text-muted-foreground text-sm font-medium">Selecione os lançamentos que deseja antecipar para hoje.</p>
          </div>
          {!isNoRateError && (
            <div className="bg-[#0A2540] text-white px-5 py-3 rounded-xl flex items-center gap-3 shadow-lg">
              <Percent size={18} className="text-white/70" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mb-1">Taxa Real</span>
                <span className="text-sm font-bold leading-none">{anticipationRateMonthly}% a.m.</span>
              </div>
            </div>
          )}
        </div>

        {isNoRateError ? (
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-12 space-y-8 border-b md:border-b-0 md:border-r border-border">
                <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[24px] flex items-center justify-center border border-amber-100"><Lock size={32} /></div>
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-primary tracking-tight leading-tight uppercase">Habilitação Recomendada</h3>
                  <p className="text-slate-500 text-sm leading-relaxed max-w-sm">Esta conta ainda não possui uma taxa de antecipação ativa. O recurso é fundamental para garantir liquidez em poucos cliques.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleSupportClick} className="px-8 py-4 bg-[#0A2540] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"><MessageSquare size={18} /> Falar com Suporte</button>
                  <Dialog open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen}>
                    <DialogTrigger asChild>
                      <button className="px-8 py-4 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 flex items-center justify-center gap-2"><HelpCircle size={18} /> Saiba Mais</button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[550px] p-0 overflow-hidden border-none bg-white rounded-2xl flex flex-col text-left">
                      <div className="p-10 space-y-8">
                        <div className="space-y-2">
                          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-bold uppercase mb-2">Liquidez Imediata</div>
                          <h2 className="text-3xl font-bold text-[#0A2540] tracking-tighter">O que é a Antecipação?</h2>
                          <p className="text-slate-500 text-sm font-medium">Antecipe seus recebíveis em até 2 horas úteis.</p>
                        </div>
                        <div className="grid gap-4">
                          {[{ icon: <TrendingUp size={20} />, title: "Fluxo de Caixa", desc: "Saldo imediato para renovar estoque." }, { icon: <Clock size={20} />, title: "Rapidez", desc: "Crédito liberado em poucas horas." }].map((item, id) => (
                            <div key={id} className="flex gap-4 items-start p-4 bg-slate-50/80 rounded-xl">
                               <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm text-[#0A2540]">{item.icon}</div>
                               <div className="space-y-1"><span className="text-sm font-bold text-[#0A2540]">{item.title}</span><p className="text-[11px] text-slate-500">{item.desc}</p></div>
                            </div>
                          ))}
                        </div>
                        <button onClick={() => { setIsLearnMoreOpen(false); handleSupportClick(); }} className="w-full py-4 bg-[#0A2540] text-white rounded-xl font-bold text-sm">Habilitar via Suporte</button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              <div className="bg-slate-50/50 p-12 flex items-center justify-center relative">
                 <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center shadow-2xl border border-border"><TrendingUp size={64} className="text-slate-100" /></div>
                 <div className="absolute top-0 right-0 w-12 h-12 bg-rose-500 rounded-full flex items-center justify-center text-white shadow-lg -translate-x-2 translate-y-2"><Lock size={24} /></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start text-left">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center px-2">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Lançamentos Disponíveis</h3>
                <span className="text-[10px] font-bold text-primary opacity-40">{availableSettlements.length} Lançamentos</span>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  [1,2,3,4].map(i => <div key={i} className="h-20 bg-muted/20 animate-pulse rounded-xl border border-dashed border-border" />)
                ) : availableSettlements.length > 0 ? (
                  availableSettlements.map((s) => (
                    <div key={s.id} onClick={() => toggleSelect(s.id)} className={cn("group p-5 rounded-xl border transition-all cursor-pointer flex items-center justify-between", selectedIds.has(s.id) ? "bg-[#0A2540]/5 border-[#0A2540] shadow-md translate-x-1" : "bg-white border-border hover:border-slate-300")}>
                      <div className="flex items-center gap-5">
                        <div className={cn("w-5 h-5 rounded-lg border-2 flex items-center justify-center", selectedIds.has(s.id) ? "bg-[#0A2540] border-[#0A2540]" : "bg-white border-slate-200")}>
                          {selectedIds.has(s.id) && <Check size={12} className="text-white" />}
                        </div>
                        <div className="flex flex-col gap-0.5 text-left">
                          <span className="text-sm font-bold text-primary tracking-tight">Transação #optr_{s.id.toString().slice(-10).toUpperCase()}</span>
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase"><Calendar size={10} /> Vencimento {formatDate(s.settlement_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <div>
                          <span className="text-sm font-bold text-primary block">{formatCurrency(s.amount_gross)}</span>
                          <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">{s.days_to_anticipate} dias p/ venc.</span>
                        </div>
                        <ChevronRight size={18} className="text-slate-300" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-2xl border-2 border-dashed border-border opacity-50"><AlertTriangle size={40} className="mb-4" /><p className="text-sm font-bold text-muted-foreground uppercase">Sem lançamentos</p></div>
                )}
              </div>
            </div>

            <div className="sticky top-24">
              <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col text-left">
                <div className="p-6 bg-[#0A2540] text-white">
                  <h3 className="text-lg font-bold">Resumo da Simulação</h3>
                  <div className="flex items-center gap-2 mt-1 opacity-60"><PieChartIcon size={14} /><span className="text-[10px] font-bold uppercase tracking-widest">{selectedIds.size} Selecionados</span></div>
                </div>
                <div className="p-6 space-y-6 flex-1 text-left">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium"><span className="text-muted-foreground">Valor Bruto Total</span><span className="text-primary font-bold">{formatCurrency(simulation.gross)}</span></div>
                    <div className="flex justify-between items-center text-sm font-medium"><span className="text-muted-foreground">Taxas MDR (Ref.)</span><span className="text-rose-600 font-bold">-{formatCurrency(simulation.mdr)}</span></div>
                    <div className="flex justify-between items-center text-sm font-medium"><span className="text-muted-foreground">Custo Antecipação</span><span className="text-amber-600 font-bold">-{formatCurrency(simulation.anticipationFee)}</span></div>
                    <div className="pt-5 border-t border-dashed border-border text-center">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2">Líquido Final p/ Hoje</span>
                      <span className="text-3xl font-extrabold text-emerald-500 tracking-tighter block mb-1">{formatCurrency(simulation.net)}</span>
                    </div>
                  </div>
                  <button disabled={selectedIds.size === 0} className={cn("w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all", selectedIds.size > 0 ? "bg-[#0A2540] text-white shadow-xl shadow-[#0A2540]/20 hover:scale-[1.01]" : "bg-slate-100 text-slate-400 cursor-not-allowed")}>
                    Confirmar Antecipação <ArrowRight size={18} />
                  </button>
                </div>
                <div className="p-6 bg-slate-50 border-t border-border flex gap-3 items-start">
                  <div className="p-2 bg-white rounded-lg border border-border shadow-sm text-[#0A2540]"><TrendingUp size={16} /></div>
                  <div className="space-y-1"><span className="text-[10px] font-bold text-primary uppercase tracking-tight font-bold">Dica OrionPay</span><p className="text-[10px] text-muted-foreground leading-relaxed font-medium">Equilibre seu caixa sem depender de empréstimos bancários caros.</p></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
