'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  CreditCard, 
  Info, 
  Calendar,
  Zap,
  HelpCircle,
  BarChart3,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

const BrandIcon = ({ brand }: { brand: string }) => {
  const isVisa = brand.toLowerCase().includes('visa');
  const isMaster = brand.toLowerCase().includes('master');
  const isElo = brand.toLowerCase().includes('elo');
  const isAmex = brand.toLowerCase().includes('amex');

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5">
        {isVisa && <div className="w-6 h-4 bg-[#1A1F71] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">VISA</div>}
        {isMaster && <div className="w-6 h-4 bg-[#EB001B] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">MC</div>}
        {isElo && <div className="w-6 h-4 bg-[#00AEEF] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">ELO</div>}
        {isAmex && <div className="w-6 h-4 bg-[#007BC1] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">AMEX</div>}
      </div>
      <span className="text-sm font-bold text-primary">{brand}</span>
    </div>
  );
};

export default function MyPricingPage() {
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const pricingData = [
    { 
      id: 'credit_spot',
      title: 'Crédito à Vista', 
      period: 'D+30', 
      icon: CreditCard,
      items: [
        { id: 'cs_visa_master', brand: 'Visa / Mastercard', rate: '2.45%', isActive: true },
        { id: 'cs_elo_amex', brand: 'Elo / Amex / Hiper', rate: '3.10%', isActive: true },
        { id: 'cs_others', brand: 'Outros (Diners)', rate: '3.80%', isActive: false },
      ]
    },
    { 
      id: 'debit',
      title: 'Débito', 
      period: 'D+1', 
      icon: CreditCard,
      items: [
        { id: 'db_visa_master', brand: 'Visa / Mastercard', rate: '1.20%', isActive: true },
        { id: 'db_elo', brand: 'Elo', rate: '1.45%', isActive: true },
        { id: 'db_others', brand: 'Outros', rate: '1.80%', isActive: true },
      ]
    },
    { 
      id: 'credit_installment',
      title: 'Crédito Parcelado', 
      period: 'D+30 (Primeira)', 
      icon: CreditCard,
      items: [
        { id: 'ci_visa_master', brand: 'Visa / Mastercard', rate: '2.95% + 1.20%', isActive: true },
        { id: 'ci_elo_amex', brand: 'Elo / Amex', rate: '3.60% + 1.50%', isActive: true },
      ]
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-primary tracking-tight">Minhas Taxas</h2>
            <p className="text-muted-foreground text-sm">Consulte as taxas contratuais vigentes para seu estabelecimento.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors text-sm font-bold text-primary">
            <BarChart3 size={18} />
            Exportar Tabela
          </button>
        </div>

        {/* Pricing Info Banner */}
        <div className="bg-primary/5 border border-primary/10 p-6 rounded-3xl flex gap-4">
          <Zap size={24} className="text-primary shrink-0" fill="currentColor" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-primary">Antecipação Automática Ativa</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Suas vendas a crédito estão sendo liquidadas em <span className="font-bold text-primary">D+1</span>. 
              Estes valores são definidos em contrato e não podem ser alterados diretamente.
            </p>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pricingData.map((category) => (
            <div key={category.id} className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border bg-muted/10 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/5 rounded-xl text-primary">
                    <category.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider">{category.title}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                      <Calendar size={10} />
                      Fluxo: {category.period}
                    </div>
                  </div>
                </div>
                <HelpCircle size={16} className="text-muted-foreground opacity-30 cursor-help" />
              </div>

              <div className="p-6 space-y-4 flex-1">
                {category.items.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "flex items-center justify-between p-4 rounded-2xl border transition-all",
                      item.isActive ? "bg-white border-border" : "bg-muted/30 border-dashed border-border opacity-60 grayscale"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        item.isActive ? "bg-accent" : "bg-muted-foreground/30"
                      )} />
                      <BrandIcon brand={item.brand} />
                    </div>

                    <div className="relative group">
                      <div 
                        className="px-3 py-1 bg-muted/50 rounded-lg border border-input text-xs font-mono font-bold text-primary cursor-default"
                        onMouseEnter={() => setShowTooltip(item.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                      >
                        {item.rate}
                      </div>
                      {showTooltip === item.id && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-primary text-white text-[10px] font-bold rounded-lg shadow-xl z-10 text-center animate-in fade-in slide-in-from-bottom-1">
                          Taxa contratual para {item.brand}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-primary" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Negotiate Card */}
          <div className="bg-primary p-8 rounded-3xl text-primary-foreground flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-10%] opacity-10 group-hover:scale-110 transition-transform duration-500">
              <TrendingUp size={200} />
            </div>
            <div className="relative z-10 space-y-4">
              <h3 className="text-xl font-bold">Precisa de taxas melhores?</h3>
              <p className="text-primary-foreground/70 text-sm max-w-xs leading-relaxed">
                Nossa equipe de análise comercial revisa seu perfil trimestralmente para oferecer as melhores condições do mercado.
              </p>
            </div>
            <div className="relative z-10 pt-8">
              <button className="px-6 py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center gap-2 shadow-xl shadow-accent/20">
                Falar com Especialista
                <ArrowUpRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

