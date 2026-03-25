'use client';

import React, { useState, useMemo } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery } from '@tanstack/react-query';
import { mockSettlements } from '@/services/api';
import { Settlement } from '@/types';
import { format, addDays } from 'date-fns';
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
  PieChart as PieChartIcon
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { cn } from '@/lib/utils';

export default function AnticipationPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const anticipationRate = 0.025; // 2.5% fixed rate for demo

  const { data: availableSettlements = [], isLoading } = useQuery({
    queryKey: ['available-for-anticipation'],
    queryFn: async () => {
      // In real app: const { data } = await api.get('/settlements/available-anticipation');
      await new Promise(resolve => setTimeout(resolve, 600));
      // Only settlements that are not PAID and have a future date are available
      return mockSettlements.filter(s => s.status !== 'PAID') as Settlement[];
    },
  });

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === availableSettlements.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(availableSettlements.map(s => s.id)));
    }
  };

  const simulation = useMemo(() => {
    const selectedItems = availableSettlements.filter(s => selectedIds.has(s.id));
    const gross = selectedItems.reduce((acc, curr) => acc + curr.amount_gross, 0);
    const mdr = selectedItems.reduce((acc, curr) => acc + curr.fee_mdr, 0);
    const anticipationFee = gross * anticipationRate;
    const net = gross - mdr - anticipationFee;

    return {
      gross,
      mdr,
      anticipationFee,
      net,
      count: selectedItems.length
    };
  }, [selectedIds, availableSettlements]);

  const chartData = [
    { name: 'Líquido a Receber', value: simulation.net, color: '#10b981' },
    { name: 'Taxas MDR', value: simulation.mdr, color: '#0a192f' },
    { name: 'Taxa Antecipação', value: simulation.anticipationFee, color: '#f59e0b' },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
              <Zap size={20} className="text-accent fill-accent" />
              Antecipação de Recebíveis
            </h2>
            <p className="text-muted-foreground text-sm">Transforme suas vendas futuras em saldo imediato na conta.</p>
          </div>
          <div className="bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <Info size={16} className="text-amber-600" />
            <span className="text-xs font-bold text-amber-800">Taxa de Antecipação: {anticipationRate * 100}% a.m.</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Selection List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-primary uppercase tracking-widest">Lançamentos Disponíveis</h3>
              <button 
                onClick={toggleSelectAll}
                className="text-xs font-bold text-accent hover:underline"
              >
                {selectedIds.size === availableSettlements.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
                ))
              ) : availableSettlements.length > 0 ? (
                availableSettlements.map((s) => (
                  <div 
                    key={s.id}
                    onClick={() => toggleSelect(s.id)}
                    className={cn(
                      "p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group",
                      selectedIds.has(s.id) 
                        ? "bg-primary/5 border-primary shadow-sm" 
                        : "bg-card border-border hover:border-muted-foreground/30"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        selectedIds.has(s.id) ? "bg-primary border-primary" : "bg-white border-border group-hover:border-primary/50"
                      )}>
                        {selectedIds.has(s.id) && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">Transação #{s.transaction_id.slice(-6)}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium">
                          <Calendar size={10} />
                          Recebimento em: {format(new Date(s.settlement_date), 'dd/MM/yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-primary block">{formatCurrency(s.amount_gross)}</span>
                      <span className="text-[10px] text-muted-foreground font-medium">Bruto</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center bg-muted/20 rounded-2xl border border-dashed border-border">
                  <AlertTriangle size={32} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhum lançamento futuro disponível para antecipação.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Simulation & Checkout */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-xl overflow-hidden sticky top-8">
              <div className="p-6 bg-primary text-primary-foreground">
                <h3 className="text-lg font-bold mb-1">Resumo da Simulação</h3>
                <p className="text-xs text-primary-foreground/60 font-medium">{selectedIds.size} itens selecionados</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Simulation Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Valor Bruto Total</span>
                    <span className="text-primary font-bold">{formatCurrency(simulation.gross)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Taxas MDR (Contratuais)</span>
                    <span className="text-rose-500 font-bold">-{formatCurrency(simulation.mdr)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground font-medium">Taxa de Antecipação ({anticipationRate * 100}%)</span>
                    <span className="text-amber-500 font-bold">-{formatCurrency(simulation.anticipationFee)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between items-center">
                    <span className="text-primary font-bold">Valor Líquido Final</span>
                    <span className="text-2xl font-bold text-accent tracking-tighter">{formatCurrency(simulation.net)}</span>
                  </div>
                </div>

                {/* Visual Impact Chart */}
                {simulation.gross > 0 && (
                  <div className="h-[180px] w-full py-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                          ))}
                        </Pie>
                        <RechartsTooltip 
                          contentStyle={{ fontSize: '10px', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-4 mt-2">
                      {chartData.map((item) => (
                        <div key={item.name} className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button 
                    disabled={selectedIds.size === 0}
                    className={cn(
                      "w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-accent/20",
                      selectedIds.size > 0 
                        ? "bg-accent text-accent-foreground hover:opacity-90" 
                        : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                    )}
                  >
                    Confirmar Antecipação
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-[10px] text-center text-muted-foreground font-medium px-4">
                    Ao confirmar, o valor líquido será creditado em sua conta em até 2 horas úteis.
                  </p>
                </div>
              </div>
            </div>

            {/* Warning Card */}
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex gap-3">
              <TrendingUp size={20} className="text-blue-600 shrink-0" />
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-900 block">Dica Financeira</span>
                <p className="text-[10px] text-blue-800 leading-relaxed">
                  Antecipar valores pode ajudar no seu fluxo de caixa imediato, mas lembre-se de considerar o custo efetivo total da operação.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
