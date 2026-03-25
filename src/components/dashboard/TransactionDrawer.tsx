'use client';

import React from 'react';
import { 
  X, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  History,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Building2,
  Cpu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Transaction, TransactionEvent } from '@/types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionDrawerProps {
  transaction: Transaction | null;
  events: TransactionEvent[];
  isOpen: boolean;
  onClose: () => void;
  isLoadingEvents?: boolean;
}

export function TransactionDrawer({ 
  transaction, 
  events, 
  isOpen, 
  onClose,
  isLoadingEvents 
}: TransactionDrawerProps) {
  if (!transaction) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed right-0 top-0 h-full w-full max-w-lg bg-card z-50 shadow-2xl transition-transform duration-300 ease-in-out border-l border-border flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Detalhes da Transação</span>
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              ID: {transaction.id}
              <button className="p-1 hover:bg-muted rounded transition-colors">
                <ExternalLink size={14} className="text-muted-foreground" />
              </button>
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Main Info Card */}
          <div className="bg-primary text-primary-foreground p-6 rounded-2xl shadow-lg relative overflow-hidden group">
            <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <CreditCard size={200} />
            </div>
            <div className="relative z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex flex-col">
                  <span className="text-primary-foreground/70 text-sm font-medium">Valor Total</span>
                  <span className="text-3xl font-bold">{formatCurrency(transaction.amount)}</span>
                </div>
                <div className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-xs font-bold">
                  {transaction.status}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
                <div className="flex flex-col">
                  <span className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-wider">Data/Hora</span>
                  <span className="text-sm font-semibold">{format(new Date(transaction.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-primary-foreground/70 text-[10px] uppercase font-bold tracking-wider">NSU OrionPay</span>
                  <span className="text-sm font-mono font-bold tracking-wider">{transaction.nsu}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <ShieldCheck size={16} />
              Dados do Pagamento (PCI/LGPD)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Portador</span>
                <span className="text-sm font-bold text-primary truncate block">{transaction.card_holder_name}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Número do Cartão</span>
                <span className="text-sm font-bold text-primary font-mono block">**** **** **** {transaction.card_last_four}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Bandeira</span>
                <span className="text-sm font-bold text-primary block">{transaction.brand}</span>
              </div>
              <div className="bg-muted/50 p-4 rounded-xl border border-border">
                <span className="text-[10px] text-muted-foreground font-bold uppercase block mb-1">Cód. Autorização</span>
                <span className="text-sm font-bold text-primary block">{transaction.authorization_code || '---'}</span>
              </div>
            </div>
          </div>

          {/* Event Trail Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <History size={16} />
              Trilha de Eventos (Event Sourcing)
            </div>
            <div className="space-y-0 pl-2">
              {isLoadingEvents ? (
                <div className="py-4 animate-pulse space-y-4">
                  <div className="h-10 bg-muted rounded-lg w-full" />
                  <div className="h-10 bg-muted rounded-lg w-full" />
                </div>
              ) : events.length > 0 ? (
                events.map((event, idx) => (
                  <div key={event.id} className="relative pl-8 pb-8 group">
                    {/* Line */}
                    {idx !== events.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border group-hover:bg-primary transition-colors" />
                    )}
                    {/* Dot */}
                    <div className={cn(
                      "absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-card flex items-center justify-center z-10",
                      idx === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {idx === 0 ? <CheckCircle2 size={12} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    {/* Content */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-primary">{event.event_type.replace(/_/g, ' ')}</span>
                        <span className="text-[10px] font-medium text-muted-foreground">{format(new Date(event.created_at), "HH:mm:ss")}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                        <span className="px-1.5 py-0.5 bg-muted rounded border border-border">{event.status_from}</span>
                        <ChevronRight size={10} />
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded border border-primary/20">{event.status_to}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                  <AlertCircle size={24} className="mx-auto text-muted-foreground/40 mb-2" />
                  <p className="text-xs text-muted-foreground">Nenhum evento registrado</p>
                </div>
              )}
            </div>
          </div>

          {/* Technical Metadata Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-sm">
              <Cpu size={16} />
              Metadados do Sistema
            </div>
            <div className="bg-muted/20 p-4 rounded-xl border border-border space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Merchant ID:</span>
                <span className="font-mono text-primary font-bold">{transaction.merchant_id}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Terminal ID:</span>
                <span className="font-mono text-primary font-bold">{transaction.terminal_id}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Correlation ID:</span>
                <span className="font-mono text-primary font-bold truncate ml-4">550e8400-e29b-41d4-a716-446655440000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border flex gap-3">
          <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold">
            Imprimir Comprovante
          </button>
          <button className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-bold text-red-600">
            Estornar
          </button>
        </div>
      </div>
    </>
  );
}
