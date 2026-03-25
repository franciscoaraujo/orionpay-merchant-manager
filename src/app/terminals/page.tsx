'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockTerminals } from '@/services/api';
import { Terminal } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Terminal as TerminalIcon, 
  Smartphone, 
  Globe, 
  Monitor, 
  MoreVertical, 
  Lock, 
  Unlock, 
  Search, 
  Plus, 
  ShieldCheck, 
  ShieldAlert,
  Signal,
  SignalLow
} from 'lucide-react';
import { TerminalForm } from '@/components/dashboard/TerminalForm';
import { TerminalDetails } from '@/components/dashboard/TerminalDetails';
import { cn } from '@/lib/utils';

export default function TerminalsPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<Terminal['status'] | 'ALL'>('ALL');
  const [selectedTerminal, setSelectedTerminal] = useState<Terminal | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: terminals = [], isLoading } = useQuery({
    queryKey: ['terminals'],
    queryFn: async () => {
      // In real app: const { data } = await api.get('/terminals');
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockTerminals as Terminal[];
    },
  });

  const createTerminalMutation = useMutation({
    mutationFn: async (newTerminal: Partial<Terminal>) => {
      // In real app: await api.post('/terminals', newTerminal);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        ...newTerminal,
        id: `t_${Math.random().toString(36).substr(2, 9)}`,
        status: 'ACTIVE',
        last_activity: new Date().toISOString(),
        merchant_id: 'm_001'
      } as Terminal;
    },
    onSuccess: (newTerminal) => {
      queryClient.setQueryData(['terminals'], (old: Terminal[] | undefined) => {
        return old ? [newTerminal, ...old] : [newTerminal];
      });
      setIsFormOpen(false);
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (terminalId: string) => {
      // In real app: await api.patch(`/terminals/${terminalId}/toggle-status`);
      await new Promise(resolve => setTimeout(resolve, 800));
      return terminalId;
    },
    onSuccess: (terminalId) => {
      // Optimistic UI or simple refetch
      queryClient.setQueryData(['terminals'], (old: Terminal[] | undefined) => {
        if (!old) return [];
        return old.map(t => 
          t.id === terminalId 
            ? { ...t, status: t.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED' } 
            : t
        );
      });
    }
  });

  const filteredTerminals = terminals.filter(t => {
    const matchesSearch = t.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusConfig = (status: Terminal['status']) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Ativo', color: 'text-emerald-600 bg-emerald-100 border-emerald-200', icon: Signal };
      case 'BLOCKED':
        return { label: 'Bloqueado', color: 'text-rose-600 bg-rose-100 border-rose-200', icon: Lock };
      case 'OFFLINE':
        return { label: 'Offline', color: 'text-gray-500 bg-gray-100 border-gray-200', icon: SignalLow };
    }
  };

  const getTypeIcon = (type: Terminal['type']) => {
    switch (type) {
      case 'SMART_POS': return Smartphone;
      case 'POS': return TerminalIcon;
      case 'E-COMMERCE': return Globe;
      case 'MOBILE': return Smartphone;
      default: return Monitor;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
              <TerminalIcon size={20} className="text-primary" />
              Gestão de Terminais
            </h2>
            <p className="text-muted-foreground text-sm">Controle e monitore suas maquininhas e pontos de venda.</p>
          </div>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold shadow-lg shadow-primary/10"
          >
            <Plus size={18} />
            Novo Terminal
          </button>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Total de Máquinas</span>
            <span className="text-2xl font-bold text-primary">{terminals.length}</span>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Ativas Agora</span>
            <span className="text-2xl font-bold text-emerald-600">{terminals.filter(t => t.status === 'ACTIVE').length}</span>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Bloqueadas</span>
            <span className="text-2xl font-bold text-rose-600">{terminals.filter(t => t.status === 'BLOCKED').length}</span>
          </div>
          <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Aguardando Update</span>
            <span className="text-2xl font-bold text-blue-600">1</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por número de série ou modelo..."
              className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-lg border border-input w-full md:w-auto">
            {(['ALL', 'ACTIVE', 'BLOCKED', 'OFFLINE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex-1 md:flex-none",
                  statusFilter === status 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {status === 'ALL' ? 'Todos' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Terminals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl border border-border" />
            ))
          ) : filteredTerminals.length > 0 ? (
            filteredTerminals.map((terminal) => {
              const status = getStatusConfig(terminal.status);
              const Icon = getTypeIcon(terminal.type);
              const isToggling = toggleStatusMutation.isPending && toggleStatusMutation.variables === terminal.id;

              return (
                <div 
                  key={terminal.id} 
                  onClick={() => setSelectedTerminal(terminal)}
                  className={cn(
                    "bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col transition-all hover:shadow-md cursor-pointer group",
                    terminal.status === 'BLOCKED' && "opacity-80 grayscale-[0.5]"
                  )}
                >
                  {/* Card Header */}
                  <div className="p-5 flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-muted rounded-xl group-hover:bg-primary/5 transition-colors">
                        <Icon size={24} className="text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-primary">{terminal.model}</span>
                        <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">SN: {terminal.serial_number}</span>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  {/* Card Body */}
                  <div className="px-5 pb-5 space-y-4 flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Status</span>
                        <div className={cn(
                          "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border w-fit",
                          status.color
                        )}>
                          <status.icon size={10} />
                          {status.label}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Última Atividade</span>
                        <span className="text-[10px] font-bold text-primary block">
                          {formatDistanceToNow(new Date(terminal.last_activity), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Versão</span>
                        <span className="text-[10px] font-bold text-primary block">{terminal.version}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Tipo</span>
                        <span className="text-[10px] font-bold text-primary block">{terminal.type.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="px-5 py-4 bg-muted/30 border-t border-border mt-auto flex gap-2">
                    <button 
                      onClick={() => toggleStatusMutation.mutate(terminal.id)}
                      disabled={isToggling}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all",
                        terminal.status === 'BLOCKED' 
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200" 
                          : "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200",
                        isToggling && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isToggling ? (
                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : terminal.status === 'BLOCKED' ? (
                        <><Unlock size={14} /> Desbloquear</>
                      ) : (
                        <><Lock size={14} /> Bloquear Máquina</>
                      )}
                    </button>
                    <button className="px-3 py-2 bg-white border border-border rounded-lg text-primary hover:bg-muted transition-colors">
                      <Monitor size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full p-20 text-center bg-card rounded-3xl border border-dashed border-border">
              <TerminalIcon size={48} className="mx-auto text-muted-foreground/20 mb-4" />
              <h4 className="text-lg font-bold text-primary">Nenhum terminal encontrado</h4>
              <p className="text-sm text-muted-foreground">Tente buscar por outro número de série ou modelo.</p>
            </div>
          )}
        </div>

        {/* Security Warning */}
        <div className="bg-primary p-6 rounded-2xl flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
          <div className="absolute left-[-2%] top-[-20%] opacity-10">
            <ShieldCheck size={160} className="text-white" />
          </div>
          <div className="relative z-10 flex-1 space-y-2 text-center md:text-left">
            <h4 className="text-white font-bold text-lg">Segurança de Terminais OrionPay</h4>
            <p className="text-primary-foreground/70 text-sm max-w-2xl">
              Seu parque de terminais é protegido por criptografia de ponta a ponta. Em caso de perda ou roubo, utilize o bloqueio remoto imediato para garantir a segurança dos dados transacionais.
            </p>
          </div>
          <div className="relative z-10">
            <button className="px-6 py-3 bg-white text-primary rounded-xl font-bold text-sm hover:bg-muted transition-all shadow-xl">
              Relatório de Segurança
            </button>
          </div>
        </div>

        {/* Terminal Creation Form Modal */}
        <TerminalForm 
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={(data) => createTerminalMutation.mutate(data)}
          isLoading={createTerminalMutation.isPending}
        />

        {/* Terminal Details Modal */}
        <TerminalDetails 
          terminal={selectedTerminal}
          onClose={() => setSelectedTerminal(null)}
        />
      </div>
    </MainLayout>
  );
}
