'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Sidebar } from './Sidebar';
import { useTransactionRealtimeNotifications } from '@/hooks/use-transaction-realtime-notifications';
import { AuthService } from '@/services/auth-service';
import { MerchantService } from '@/services/merchant-service';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const merchantId = AuthService.getMerchantId() ?? '';
  useTransactionRealtimeNotifications(merchantId);

  const [merchantName, setMerchantName] = useState<string>(() => AuthService.getMerchantName() ?? '');

  useEffect(() => {
    if (!merchantId) return;
    if (merchantName) return;

    MerchantService.getMerchantProfile(merchantId)
      .then((profile) => {
        const name = profile?.name?.trim() ?? '';
        if (!name) return;
        setMerchantName(name);
        try {
          localStorage.setItem('auth:merchantName', name);
        } catch {}
      })
      .catch(() => undefined);
  }, [merchantId, merchantName]);

  const initials = useMemo(() => {
    const src = (merchantName || 'Orion Enterprise').trim();
    const parts = src.split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? 'O';
    const second = parts[1]?.[0] ?? (parts[0]?.[1] ?? 'E');
    return `${first}${second}`.toUpperCase();
  }, [merchantName]);

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8 h-full scroll-smooth">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Portal do Lojista</h1>
            <p className="text-muted-foreground text-sm">
              Bem-vindo de volta{merchantName ? `, ${merchantName}` : ''}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-card border border-border px-4 py-2 rounded-lg flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium">Sistema Online</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
              {initials}
            </div>
          </div>
        </header>
        {children}
      </main>
    </div>
  );
}
