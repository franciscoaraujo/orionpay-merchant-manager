import React from 'react';
import { BrandDistributionItem } from '@/services/merchant-service';

interface BrandDistributionListProps {
  data: BrandDistributionItem[];
  isLoading?: boolean;
}

const BrandIcon = ({ brand }: { brand: string }) => {
  const b = brand.toLowerCase();
  
  // Identifica a bandeira baseada na string (original ou formatada)
  const isVisa = b.includes('visa') || b.includes('credit'); // Map credit to Visa for visual test
  const isMaster = b.includes('master') || b.includes('debit'); // Map debit to Master for visual test
  const isElo = b.includes('elo');
  const isAmex = b.includes('amex');
  const isHiper = b.includes('hiper');

  // Formata o nome para exibição amigável
  const displayBrand = brand
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1">
        {isVisa && <div className="w-5 h-3 bg-[#1A1F71] rounded-xs flex items-center justify-center text-[5px] text-white font-bold italic">VISA</div>}
        {isMaster && <div className="w-5 h-3 bg-[#EB001B] rounded-xs flex items-center justify-center text-[5px] text-white font-bold italic">MC</div>}
        {isElo && <div className="w-5 h-3 bg-[#00AEEF] rounded-xs flex items-center justify-center text-[5px] text-white font-bold italic">ELO</div>}
        {isAmex && <div className="w-5 h-3 bg-[#007BC1] rounded-xs flex items-center justify-center text-[5px] text-white font-bold italic">AMEX</div>}
        {isHiper && <div className="w-5 h-3 bg-[#ED1C24] rounded-xs flex items-center justify-center text-[5px] text-white font-bold italic">HIPER</div>}
      </div>
      <span className="font-bold text-primary">{displayBrand}</span>
    </div>
  );
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 0 
  }).format(value);
};

export function BrandDistributionList({ data, isLoading }: BrandDistributionListProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm animate-pulse h-full">
        <div className="w-48 h-6 bg-gray-100 rounded mb-8" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="w-20 h-4 bg-gray-100 rounded" />
                <div className="w-16 h-4 bg-gray-100 rounded" />
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Distribuição por Bandeira</h2>
        <p className="text-sm text-slate-400 font-medium italic">Share de volume transacionado</p>
      </div>

      <div className="space-y-8 flex-grow overflow-y-auto pr-2 custom-scrollbar">
        {data.map((item) => (
          <div key={item.brand} className="space-y-3 group cursor-default">
            <div className="flex justify-between items-end">
              <div className="flex flex-col gap-1">
                <BrandIcon brand={item.brand} />
                <span className="text-lg font-bold text-slate-900 tracking-tight">{formatCurrency(item.value)}</span>
              </div>
              <span className="text-sm font-bold text-slate-600 bg-slate-50 px-2 py-1 rounded-lg">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
            
            <div className="w-full h-2.5 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
              <div 
                className="h-full bg-[#0A2540] rounded-full transition-all duration-1000 group-hover:bg-[#1C4E80]" 
                style={{ width: `${item.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Dados atualizados em tempo real</span>
        </div>
      </div>
    </div>
  );
}
