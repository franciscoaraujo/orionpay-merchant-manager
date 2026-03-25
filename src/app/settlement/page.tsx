'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { mockSettlements } from '@/services/api';
import { Settlement } from '@/types';
import { format, isSameMonth, startOfMonth, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Building2,
  Download,
  Filter,
  Lock,
  Unlock,
  AlertCircle,
  ShieldCheck,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SettlementPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [hoveredEffect, setHoveredEffect] = useState<string | null>(null);

  const { data: settlements = [], isLoading } = useQuery({
    queryKey: ['settlements', format(currentMonth, 'yyyy-MM')],
    queryFn: async () => {
      // In real app: const { data } = await api.get('/settlements', { params: { month: ... } });
      await new Promise(resolve => setTimeout(resolve, 800));
      return mockSettlements as Settlement[];
    },
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const statusConfig = {
    PAID: { label: 'Pago', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
    SCHEDULED: { label: 'Agendado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
    PENDING: { label: 'Pendente', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
    CANCELLED: { label: 'Cancelado', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: Wallet },
  };

  const ownershipConfig = {
    AVAILABLE: { label: 'Disponível', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: Unlock },
    LINKED_TO_GUARANTEE: { label: 'Vinculado a Garantia', color: 'bg-amber-50 text-amber-600 border-amber-100', icon: Lock },
    ANTICIPATED: { label: 'Antecipado', color: 'bg-blue-50 text-blue-600 border-blue-100', icon: ShieldCheck },
  };

  const totalAgenda = settlements
    .reduce((acc, curr) => acc + curr.amount_net, 0);

  const totalCommitted = settlements
    .filter(s => s.ownership_status === 'LINKED_TO_GUARANTEE')
    .reduce((acc, curr) => acc + curr.amount_net, 0);

  const totalAvailable = settlements
    .filter(s => s.ownership_status === 'AVAILABLE')
    .reduce((acc, curr) => acc + curr.amount_net, 0);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">Agenda Financeira</h2>
            <p className="text-muted-foreground text-sm">Consulte seus recebíveis e datas de liquidação.</p>
          </div>
          <div className="flex items-center gap-3 bg-card p-1 rounded-xl border border-border shadow-sm">
            <button 
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft size={18} className="text-muted-foreground" />
            </button>
            <div className="px-4 py-1 flex items-center gap-2 min-w-[140px] justify-center">
              <CalendarIcon size={16} className="text-primary" />
              <span className="text-sm font-bold text-primary capitalize">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </span>
            </div>
            <button 
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* KPI Cards for Settlement */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Wallet size={120} />
            </div>
            <div className="relative z-10 space-y-4">
              <span className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-widest block">Total na Agenda</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{formatCurrency(totalAgenda)}</span>
                <div className="flex items-center gap-1 text-xs font-bold bg-white/10 px-2 py-1 rounded-full">
                  <ArrowUpRight size={12} />
                  Bruto
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm group">
            <div className="space-y-4">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Comprometido (Gravames)</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-amber-600">{formatCurrency(totalCommitted)}</span>
                <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 px-2 py-1 rounded-full border border-amber-100">
                  <Lock size={12} />
                  Travado
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card p-6 rounded-2xl border border-border shadow-sm group">
            <div className="space-y-4">
              <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest block">Disponível p/ Antecipação</span>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-emerald-600">{formatCurrency(totalAvailable)}</span>
                <div className="flex items-center gap-1 text-xs font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full border border-emerald-100">
                  <Unlock size={12} />
                  Livre
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settlement List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-primary">Detalhamento de Lançamentos</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg border border-border transition-colors text-muted-foreground">
                <Filter size={18} />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg border border-border transition-colors text-muted-foreground">
                <Download size={18} />
              </button>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Data de Liquidação</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor Bruto</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Taxas (MDR)</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor Líquido</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Titularidade</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={8} className="px-6 py-6"><div className="h-4 bg-muted rounded w-full" /></td>
                      </tr>
                    ))
                  ) : settlements.length > 0 ? (
                    settlements.map((s) => {
                      const StatusIcon = statusConfig[s.status].icon;
                      const OwnershipIcon = ownershipConfig[s.ownership_status].icon;
                      const isLocked = s.ownership_status === 'LINKED_TO_GUARANTEE';

                      return (
                        <tr key={s.id} className="hover:bg-muted/30 transition-colors cursor-pointer group relative">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-muted flex flex-col items-center justify-center border border-border">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(new Date(s.settlement_date), 'MMM', { locale: ptBR })}</span>
                                <span className="text-sm font-bold text-primary">{format(new Date(s.settlement_date), 'dd')}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-primary">Transação #{s.transaction_id.slice(-6)}</span>
                                <span className="text-[10px] text-muted-foreground font-medium">ID: {s.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                            {formatCurrency(s.amount_gross)}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-rose-500">
                            -{formatCurrency(s.fee_mdr)}
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-primary">
                            {formatCurrency(s.amount_net)}
                          </td>
                          <td className="px-6 py-4 relative">
                            <div 
                              className={cn(
                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider cursor-help",
                                ownershipConfig[s.ownership_status].color
                              )}
                              onMouseEnter={() => s.contract_effect && setHoveredEffect(s.id)}
                              onMouseLeave={() => setHoveredEffect(null)}
                            >
                              <OwnershipIcon size={10} />
                              {ownershipConfig[s.ownership_status].label}
                            </div>

                            {/* Contract Effect Popover */}
                            {hoveredEffect === s.id && s.contract_effect && (
                              <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-card border border-border rounded-xl shadow-2xl p-4 animate-in fade-in slide-in-from-bottom-2">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-widest border-b border-border pb-2">
                                    <Lock size={12} />
                                    Detalhes do Gravame
                                  </div>
                                  <div className="grid grid-cols-1 gap-2">
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-bold text-muted-foreground uppercase block">Instituição Credora</span>
                                      <span className="text-xs font-bold text-primary">{s.contract_effect.creditor_institution}</span>
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-bold text-muted-foreground uppercase block">Tipo de Efeito</span>
                                      <span className="text-xs font-medium text-primary">
                                        {s.contract_effect.effect_type === 'DOMICILE_LOCK' ? 'Trava de Domicílio' : 'Garantia de Empréstimo'}
                                      </span>
                                    </div>
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-bold text-muted-foreground uppercase block">Registro</span>
                                      <span className="text-xs font-medium text-primary">
                                        {s.contract_effect.registrar} em {s.contract_effect.registration_date}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-card" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className={cn(
                              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                              statusConfig[s.status].color
                            )}>
                              <StatusIcon size={10} />
                              {statusConfig[s.status].label}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="relative group/btn inline-block">
                              <button 
                                disabled={isLocked}
                                className={cn(
                                  "p-2 rounded-lg transition-all",
                                  isLocked 
                                    ? "bg-muted text-muted-foreground cursor-not-allowed" 
                                    : "bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground"
                                )}
                              >
                                {isLocked ? <Lock size={16} /> : <ArrowUpRight size={16} />}
                              </button>
                              
                              {isLocked && (
                                <div className="absolute right-full mr-2 top-1/2 -translate-y-1/2 hidden group-hover/btn:block w-48 p-2 bg-primary text-white text-[10px] font-bold rounded-lg shadow-xl z-20 text-center animate-in fade-in slide-in-from-right-1">
                                  Este valor não pode ser antecipado pois está vinculado a uma garantia externa
                                  <div className="absolute top-1/2 left-full -translate-y-1/2 border-8 border-transparent border-l-primary" />
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                        Nenhum lançamento encontrado para este período.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
