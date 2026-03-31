'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SalesTrendItem } from '@/services/merchant-service';

interface SalesChartProps {
  data: SalesTrendItem[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL',
    maximumFractionDigits: 0 
  }).format(value);
};

export function SalesChart({ data, isLoading }: SalesChartProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm animate-pulse h-[400px]">
        <div className="flex justify-between items-center mb-6">
          <div className="w-48 h-6 bg-gray-100 rounded" />
          <div className="flex gap-4">
            <div className="w-24 h-4 bg-gray-100 rounded" />
            <div className="w-24 h-4 bg-gray-100 rounded" />
          </div>
        </div>
        <div className="w-full h-full bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const isAllZero = data && data.length > 0 && data.every(d => (d.today || 0) === 0 && (d.yesterday || 0) === 0);

  if (!data || data.length === 0 || isAllZero) {
    return (
      <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-[400px]">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tendência de Vendas</h2>
            <p className="text-sm text-slate-400 font-medium italic">Comparativo em tempo real (Hoje vs Ontem)</p>
          </div>
        </div>
        <div className="h-[280px] w-full flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
          <div className="text-center space-y-1">
            <div className="text-sm font-bold text-slate-700">Sem dados para exibir</div>
            <div className="text-xs font-medium text-slate-400">Nenhuma venda registrada até o momento</div>
          </div>
        </div>
      </div>
    );
  }

  const safeData = data.map((item, index) => ({
    hour: typeof item.hour === 'number' && Number.isFinite(item.hour) ? item.hour : index,
    today: typeof item.today === 'number' && Number.isFinite(item.today) ? item.today : 0,
    yesterday: typeof item.yesterday === 'number' && Number.isFinite(item.yesterday) ? item.yesterday : 0,
  }));

  return (
    <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm h-[400px]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tendência de Vendas</h2>
          <p className="text-sm text-slate-400 font-medium italic">Comparativo em tempo real (Hoje vs Ontem)</p>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={safeData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorToday" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="hour" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
              tickFormatter={(hour) => `${hour}h`}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
              tickFormatter={(value) => `R$ ${value >= 1000 ? value / 1000 + 'k' : value}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                padding: '12px 16px'
              }}
              formatter={(value) => {
                const numeric =
                  typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : 0;
                return [formatCurrency(Number.isFinite(numeric) ? numeric : 0), ''];
              }}
              labelFormatter={(hour) => `Horário: ${hour}:00`}
            />
            <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px' }} />
            <Area 
              name="Hoje"
              type="monotone" 
              dataKey="today" 
              stroke="#10B981" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorToday)" 
            />
            <Area 
              name="Ontem"
              type="monotone" 
              dataKey="yesterday" 
              stroke="#94A3B8" 
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="transparent" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
