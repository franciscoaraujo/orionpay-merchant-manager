'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  ShieldCheck, 
  Key, 
  Smartphone, 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Fingerprint, 
  Eye, 
  EyeOff, 
  ChevronRight, 
  History,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SecurityActivityReport } from '@/components/dashboard/SecurityActivityReport';
import { cn } from '@/lib/utils';

export default function SecurityPage() {
  const [showApiKey, setShowApiKey] = React.useState(false);
  const [isReportOpen, setIsReportOpen] = React.useState(false);

  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">Segurança e Chaves</h2>
            <p className="text-muted-foreground text-sm">Gerencie chaves de API, acessos e preferências de segurança.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200 shadow-sm">
            <ShieldCheck size={14} />
            Proteção Nível 3 Ativa
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Security Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* API Keys Section */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <Key size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">Chaves de API</h3>
                    <p className="text-xs text-muted-foreground font-medium">Utilizadas para integrações e-commerce e automação.</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all">
                  Gerar Nova Chave
                </button>
              </div>

              <div className="space-y-4 pt-4">
                <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Chave de Produção (Live)</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">Ativa</span>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <input 
                        type={showApiKey ? "text" : "password"} 
                        readOnly
                        defaultValue="op_live_550e8400e29b41d4a716446655440000"
                        className="w-full px-4 py-2 bg-white border border-input rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                      <button 
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <button className="px-6 py-2 bg-muted text-primary rounded-xl text-xs font-bold hover:bg-border transition-all">Copiar</button>
                  </div>
                </div>

                <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Chave de Homologação (Test)</span>
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Sandbox</span>
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly
                      defaultValue="op_test_880e9400e29b41d4a716446655449999"
                      className="flex-1 px-4 py-2 bg-white border border-input rounded-xl text-sm font-mono"
                    />
                    <button className="px-6 py-2 bg-muted text-primary rounded-xl text-xs font-bold hover:bg-border transition-all">Copiar</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication Section */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/5 rounded-2xl">
                    <Smartphone size={24} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-primary">Autenticação em Duas Etapas (2FA)</h3>
                    <p className="text-xs text-muted-foreground font-medium">Garanta que apenas você possa acessar sua conta.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  <CheckCircle2 size={16} />
                  Ativado
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-6 items-center bg-muted/20 p-6 rounded-2xl border border-border">
                <div className="w-12 h-12 bg-white rounded-xl border border-border flex items-center justify-center shrink-0 shadow-sm">
                  <Fingerprint size={24} className="text-primary" />
                </div>
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <span className="text-sm font-bold text-primary">Seu dispositivo principal: iPhone 15 Pro Max</span>
                  <p className="text-xs text-muted-foreground">Última verificação via SMS em 10/03/2026 às 14:25.</p>
                </div>
                <button className="px-4 py-2 text-xs font-bold text-accent hover:underline flex items-center gap-1">
                  Alterar Método <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Security Logs & Warnings */}
          <div className="space-y-6">
            <div className="bg-primary p-8 rounded-3xl text-primary-foreground space-y-6 shadow-xl shadow-primary/20 relative overflow-hidden group">
              <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
                <ShieldAlert size={160} />
              </div>
              <div className="relative z-10 space-y-4">
                <h3 className="text-lg font-bold">Monitor de Segurança</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-medium text-primary-foreground/80">Criptografia Ponta a Ponta</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-xs font-medium text-primary-foreground/80">Monitoramento de IP</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span className="text-xs font-medium text-primary-foreground/80">Proteção Anti-Fraude</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <button 
                    onClick={() => setIsReportOpen(true)}
                    className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10"
                  >
                    Relatório de Atividade
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <History size={16} className="text-muted-foreground" />
                Logs Recentes de Acesso
              </h4>
              <div className="space-y-4">
                {[
                  { device: 'Chrome - São Paulo, BR', time: 'Há 5 min', status: 'success' },
                  { device: 'Safari - Campinas, BR', time: 'Há 2h', status: 'success' },
                  { device: 'Unknown IP - 192.168.0.1', time: 'Há 1 dia', status: 'blocked' },
                ].map((log, idx) => (
                  <div key={idx} className="flex justify-between items-center text-[10px]">
                    <div className="flex flex-col">
                      <span className={cn("font-bold", log.status === 'blocked' ? "text-rose-500" : "text-primary")}>
                        {log.device}
                      </span>
                      <span className="text-muted-foreground">{log.time}</span>
                    </div>
                    {log.status === 'blocked' ? (
                      <Lock size={12} className="text-rose-500" />
                    ) : (
                      <Unlock size={12} className="text-emerald-500" />
                    )}
                  </div>
                ))}
              </div>
              <button 
                onClick={() => setIsReportOpen(true)}
                className="w-full py-2 text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
              >
                Ver Todos os Logs
              </button>
            </div>

            <div className="bg-rose-50 border border-rose-100 p-6 rounded-3xl space-y-4">
              <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase tracking-widest">
                <AlertTriangle size={16} />
                Aviso Crítico
              </div>
              <p className="text-[10px] text-rose-700 leading-relaxed font-medium">
                Nunca compartilhe suas chaves de API ou códigos de 2FA com terceiros. A OrionPay nunca solicitará sua senha por e-mail ou telefone.
              </p>
            </div>
          </div>
        </div>

        {/* Security Activity Report Modal */}
        <SecurityActivityReport 
          isOpen={isReportOpen}
          onClose={() => setIsReportOpen(false)}
        />
      </div>
    </MainLayout>
  );
}
