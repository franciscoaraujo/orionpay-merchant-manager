import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info, Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: React.ReactNode;
  icon: LucideIcon;
  description?: string;
  infoTooltip?: string;
  action?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  isRefreshing?: boolean;
  containerClassName?: string;
  iconContainerClassName?: string;
  iconClassName?: string;
}

export function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  description, 
  infoTooltip,
  action,
  trend,
  isLoading,
  isRefreshing,
  containerClassName,
  iconContainerClassName,
  iconClassName
}: KPICardProps) {
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl" />
          <div className="w-20 h-4 bg-gray-100 rounded" />
        </div>
        <div className="w-32 h-8 bg-gray-100 rounded mb-2" />
        <div className="w-24 h-3 bg-gray-100 rounded" />
      </div>
    );
  }

  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow", containerClassName)}>
      <div className="flex items-center justify-between mb-4">
        <div className={cn("w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center relative", iconContainerClassName)}>
          <Icon size={20} className={cn("text-slate-600", iconClassName)} />
          {isRefreshing && (
            <div className="absolute -right-1 -top-1 w-4 h-4 bg-white rounded-full border border-gray-100 flex items-center justify-center">
              <Loader2 size={10} className="animate-spin text-slate-500" />
            </div>
          )}
        </div>
        {action ? (
          action
        ) : trend ? (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trend.isPositive ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
          )}>
            {trend.isPositive ? '+' : '-'}{trend.value}%
          </span>
        ) : null}
      </div>
      
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{title}</p>
          {infoTooltip && (
            <Tooltip.Provider delayDuration={150}>
              <Tooltip.Root>
                <Tooltip.Trigger asChild>
                  <button type="button" className="p-1 rounded-md hover:bg-muted transition-colors" aria-label="Informações">
                    <Info size={14} className="text-muted-foreground" />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content side="top" align="center" className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg max-w-[260px]">
                    {infoTooltip}
                    <Tooltip.Arrow className="fill-slate-900" />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </Tooltip.Provider>
          )}
        </div>
        <h3 className="text-2xl font-bold text-primary tracking-tight">{value}</h3>
        {description && <p className="text-[11px] text-muted-foreground font-medium">{description}</p>}
      </div>
    </div>
  );
}
