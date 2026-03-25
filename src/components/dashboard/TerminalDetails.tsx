'use client';

import React from 'react';
import { X, Smartphone, Terminal as TerminalIcon, Globe, Monitor, ShieldCheck, Activity, Cpu, type LucideIcon } from 'lucide-react';
import { Terminal } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TerminalDetailsProps {
  terminal: Terminal | null;
  onClose: () => void;
}

const terminalTypeIconMap: Record<Terminal['type'], LucideIcon> = {
  SMART_POS: Smartphone,
  POS: TerminalIcon,
  'E-COMMERCE': Globe,
  MOBILE: Smartphone,
};

export function TerminalDetails({ terminal, onClose }: TerminalDetailsProps) {
  if (!terminal) return null;

  const Icon = terminalTypeIconMap[terminal.type] || Monitor;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/5 rounded-xl">
              <Icon size={24} className="text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">{terminal.model}</h2>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">SN: {terminal.serial_number}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} /> Status Atual
              </span>
              <div className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border",
                terminal.status === 'ACTIVE' ? "text-emerald-600 bg-emerald-50 border-emerald-100" : 
                terminal.status === 'BLOCKED' ? "text-rose-600 bg-rose-50 border-rose-100" : 
                "text-gray-500 bg-gray-50 border-gray-100"
              )}>
                {terminal.status}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Cpu size={12} /> Versão de Firmware
              </span>
              <span className="text-sm font-bold text-primary block">{terminal.version}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck size={12} /> Merchant ID
              </span>
              <span className="text-sm font-mono font-bold text-primary block">{terminal.merchant_id}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Última Conexão</span>
              <span className="text-sm font-bold text-primary block">
                {format(new Date(terminal.last_activity), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </span>
            </div>
          </div>

          <div className="bg-muted/30 p-6 rounded-2xl border border-border space-y-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Histórico de Atividade</h4>
            <div className="space-y-4">
              {[
                { time: '5 min atrás', event: 'Transação Aprovada', amount: 'R$ 150,50' },
                { time: '1h atrás', event: 'Carga de Tabelas', amount: '---' },
                { time: '2h atrás', event: 'Login Realizado', amount: '---' },
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">{item.event}</span>
                    <span className="text-muted-foreground">{item.time}</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{item.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border flex gap-3">
          <button className="flex-1 px-4 py-2 border border-input rounded-xl hover:bg-muted transition-colors text-sm font-bold">
            Imprimir Configuração
          </button>
          <button className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-bold">
            Forçar Atualização
          </button>
        </div>
      </div>
    </div>
  );
}
