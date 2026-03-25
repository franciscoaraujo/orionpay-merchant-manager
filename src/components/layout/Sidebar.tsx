'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Receipt, 
  CalendarClock, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  CreditCard, 
  Terminal,
  LogOut,
  TrendingUp,
  Building2,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LogoutService } from '@/services/logout-service';
import { useToast } from '@/hooks/use-toast';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Receipt, label: 'Transações', href: '/transactions' },
  { icon: CalendarClock, label: 'Agenda Financeira', href: '/settlement' },
  { icon: TrendingUp, label: 'Antecipação', href: '/anticipation' },
  { icon: Terminal, label: 'Terminais', href: '/terminals' },
  { icon: CreditCard, label: 'Minhas Taxas', href: '/pricing' },
  { icon: LifeBuoy, label: 'Suporte', href: '/support' },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  return (
    <aside 
      className={cn(
        "h-full bg-primary text-primary-foreground transition-all duration-300 flex flex-col border-r border-border sticky top-0 left-0 z-30 shrink-0",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && <span className="text-xl font-bold tracking-tight">OrionPay</span>}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-md hover:bg-secondary transition-colors"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors group",
                isActive ? "bg-accent text-accent-foreground" : "hover:bg-secondary/50",
                isCollapsed && "justify-center"
              )}
            >
              <item.icon size={22} className={cn(isActive ? "text-accent-foreground" : "text-muted-foreground group-hover:text-primary-foreground")} />
              {!isCollapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-secondary space-y-2">
        <Link 
          href="/settings"
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors group",
            pathname === '/settings' ? "bg-accent text-accent-foreground" : "hover:bg-secondary/50",
            isCollapsed && "justify-center"
          )}
        >
          <Settings size={22} className={cn(pathname === '/settings' ? "text-accent-foreground" : "text-muted-foreground group-hover:text-primary-foreground")} />
          {!isCollapsed && <span className="font-medium">Configurações</span>}
        </Link>
        
        <button 
          type="button"
          onClick={async () => {
            try {
              await LogoutService.logout();
            } catch {
            } finally {
              toast({ title: 'Sessão encerrada', description: 'Você saiu da sua conta.', variant: 'success' });
              router.replace('/');
            }
          }}
          className={cn(
            "flex items-center gap-3 p-3 w-full rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors group",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut size={22} className="text-muted-foreground group-hover:text-red-500" />
          {!isCollapsed && <span className="font-medium">Sair</span>}
        </button>
      </div>
    </aside>
  );
}
