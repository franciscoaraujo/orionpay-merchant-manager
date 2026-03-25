'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  ChevronRight, 
  CheckCircle2,
  Building,
  CreditCard,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MerchantPage() {
  return (
    <MainLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">Dados do Estabelecimento</h2>
            <p className="text-muted-foreground text-sm">Informações cadastrais e domicílio bancário do lojista.</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold border border-emerald-200">
            <CheckCircle2 size={14} />
            Cadastro Ativo
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
                  <Building size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary">ORION PAY TECNOLOGIA LTDA</h3>
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">CNPJ: 12.345.678/0001-90</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={18} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Endereço Comercial</span>
                      <span className="text-sm font-medium text-primary">Av. Paulista, 1000 - Bela Vista</span>
                      <span className="text-xs text-muted-foreground">São Paulo - SP | 01310-100</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Globe size={18} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Website</span>
                      <span className="text-sm font-medium text-primary">www.orionpay.com.br</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Phone size={18} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Telefone</span>
                      <span className="text-sm font-medium text-primary">(11) 4004-9090</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={18} className="text-muted-foreground shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">E-mail de Suporte</span>
                      <span className="text-sm font-medium text-primary">suporte@orionpay.com.br</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border flex justify-end">
                <button className="px-6 py-2 bg-muted text-primary rounded-xl font-bold text-sm hover:bg-border transition-all">
                  Solicitar Alteração Cadastral
                </button>
              </div>
            </div>

            {/* Bank Info */}
            <div className="bg-card p-8 rounded-3xl border border-border shadow-sm space-y-6 relative overflow-hidden">
              <div className="absolute right-[-20px] top-[-20px] opacity-5">
                <Building2 size={160} />
              </div>
              <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-primary">Domicílio Bancário</h3>
                  <p className="text-xs text-muted-foreground font-medium">Conta onde você recebe suas vendas liquidadas.</p>
                </div>
                <div className="p-3 bg-primary/5 rounded-2xl">
                  <Building2 size={24} className="text-primary" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Banco</span>
                  <span className="text-sm font-bold text-primary">341 - Itaú Unibanco</span>
                </div>
                <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Agência</span>
                  <span className="text-sm font-bold text-primary">0001</span>
                </div>
                <div className="p-4 bg-muted/20 rounded-2xl border border-border">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase block mb-1">Conta</span>
                  <span className="text-sm font-bold text-primary">*****1234-5</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2 text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                <AlertCircle size={14} />
                Qualquer alteração bancária passará por uma análise de segurança de até 48h.
              </div>
            </div>
          </div>

          {/* Right Column: Status & Compliance */}
          <div className="space-y-6">
            <div className="bg-primary p-6 rounded-3xl text-primary-foreground space-y-6 shadow-xl shadow-primary/20">
              <div className="space-y-1">
                <span className="text-primary-foreground/60 text-[10px] uppercase font-bold tracking-widest block">Nível de Compliance</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-accent" />
                  <span className="text-xl font-bold italic tracking-tighter">Gold Merchant</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-primary-foreground/70">Documentação</span>
                    <span className="font-bold">100%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-full" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-primary-foreground/70">Segurança de Dados</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-accent w-[85%]" />
                  </div>
                </div>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all border border-white/10">
                Ver Certificado PCI
              </button>
            </div>

            <div className="bg-card p-6 rounded-3xl border border-border shadow-sm space-y-4">
              <h4 className="text-sm font-bold text-primary">Contatos Responsáveis</h4>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">JD</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">João Doria</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Sócio Administrador</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">MC</div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-primary">Maria Clara</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Responsável Financeiro</span>
                  </div>
                </div>
              </div>
              <button className="w-full py-2 text-xs font-bold text-accent hover:underline flex items-center justify-center gap-1">
                Adicionar Responsável <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
