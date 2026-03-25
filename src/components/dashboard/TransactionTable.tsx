'use client';

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  MoreHorizontal, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock,
  CreditCard,
  ChevronRight,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction, TransactionStatus } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onSelectTransaction?: (transaction: Transaction) => void;
}

const statusConfig: Record<TransactionStatus, { label: string, color: string, icon: LucideIcon }> = {
  AUTHORIZED: { label: 'Autorizado', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
  CAPTURED: { label: 'Capturado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle2 },
  DENIED: { label: 'Negado', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: XCircle },
  REFUNDED: { label: 'Estornado', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: Clock },
  FAILED: { label: 'Falha', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: XCircle },
};

export function TransactionTable({ transactions, isLoading, onSelectTransaction }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTransactions = transactions.filter(tx => 
    tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.nsu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.card_holder_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const maskCard = (lastFour: string) => `**** **** **** ${lastFour}`;

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por ID, NSU ou Portador..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-medium">
            <Filter size={16} />
            Filtros Avançados
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium">
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transação</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data/Hora</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor Bruto</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bandeira / Cartão</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">NSU</th>
                <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                // Skeleton Rows
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={7} className="px-6 py-8">
                      <div className="h-4 bg-muted rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const StatusIcon = statusConfig[tx.status].icon;
                  return (
                    <tr 
                      key={tx.id} 
                      className="hover:bg-muted/30 transition-colors cursor-pointer group"
                      onClick={() => onSelectTransaction?.(tx)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-primary group-hover:underline">{tx.id}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{tx.external_id}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-secondary-foreground font-medium">
                        {format(new Date(tx.created_at), "dd MMM yyyy, HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-muted rounded border border-border">
                            <CreditCard size={14} className="text-muted-foreground" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-primary">{tx.brand}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">{maskCard(tx.card_last_four)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border",
                          statusConfig[tx.status].color
                        )}>
                          <StatusIcon size={12} />
                          {statusConfig[tx.status].label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {tx.nsu}
                      </td>
                      <td className="px-6 py-4">
                        <button className="p-2 hover:bg-muted rounded-full transition-colors">
                          <MoreHorizontal size={18} className="text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Search size={48} className="opacity-20 mb-2" />
                      <p className="font-semibold text-primary">Nenhuma transação encontrada</p>
                      <p className="text-sm">Tente ajustar seus filtros ou busca.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
