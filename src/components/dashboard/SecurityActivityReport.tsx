'use client';

import React from 'react';
import { X, ShieldCheck, Clock, Globe, MapPin, Smartphone, AlertCircle, FileText, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SecurityActivityReportProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockSecurityLogs = [
  { id: 1, event: 'Login bem-sucedido', device: 'Chrome / MacOS', location: 'São Paulo, BR', ip: '187.12.45.10', time: new Date(Date.now() - 1000 * 60 * 5).toISOString(), status: 'success' },
  { id: 2, event: 'Alteração de Chave de API', device: 'Safari / iOS', location: 'São Paulo, BR', ip: '187.12.45.10', time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), status: 'warning' },
  { id: 3, event: 'Tentativa de Login Bloqueada', device: 'Firefox / Linux', location: 'Kiev, UA', ip: '95.161.224.190', time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), status: 'danger' },
  { id: 4, event: 'Ativação de 2FA', device: 'Chrome / MacOS', location: 'São Paulo, BR', ip: '187.12.45.10', time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), status: 'success' },
  { id: 5, event: 'Logout realizado', device: 'Chrome / MacOS', location: 'São Paulo, BR', ip: '187.12.45.10', time: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), status: 'neutral' },
  { id: 6, event: 'Novo Dispositivo Conectado', device: 'Samsung S24 / Android', location: 'Rio de Janeiro, BR', ip: '191.20.10.5', time: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), status: 'warning' },
  { id: 7, event: 'Login bem-sucedido', device: 'Edge / Windows', location: 'São Paulo, BR', ip: '187.12.45.10', time: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), status: 'success' },
];

export function SecurityActivityReport({ isOpen, onClose }: SecurityActivityReportProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-3xl rounded-3xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary text-primary-foreground rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">Relatório de Atividade de Segurança</h2>
              <p className="text-xs text-muted-foreground">Histórico detalhado de acessos e alterações críticas.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors text-primary flex items-center gap-2 text-xs font-bold border border-border">
              <Download size={16} />
              Exportar PDF
            </button>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block mb-1">Logins com Sucesso</span>
                <span className="text-2xl font-bold text-emerald-600">42</span>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl">
                <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">Alertas de Alteração</span>
                <span className="text-2xl font-bold text-amber-600">03</span>
              </div>
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl">
                <span className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Acessos Bloqueados</span>
                <span className="text-2xl font-bold text-rose-600">01</span>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Evento</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dispositivo / IP</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Localização</th>
                    <th className="px-4 py-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data / Hora</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mockSecurityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-2 h-2 rounded-full",
                            log.status === 'success' ? "bg-emerald-500" :
                            log.status === 'warning' ? "bg-amber-500" :
                            log.status === 'danger' ? "bg-rose-500" : "bg-gray-400"
                          )} />
                          <span className="text-xs font-bold text-primary">{log.event}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-primary">{log.device}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{log.ip}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin size={12} />
                          {log.location}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs font-medium text-primary">
                        {format(new Date(log.time), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-muted/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground">
            <AlertCircle size={14} className="text-blue-500" />
            Logs retidos por 90 dias conforme política PCI-DSS.
          </div>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
}
