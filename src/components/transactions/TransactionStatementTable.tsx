'use client';

import React, { useMemo, useState } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as Tooltip from '@radix-ui/react-tooltip';
import { ArrowUpDown, CheckCircle2, ChevronDown, ChevronUp, Clock, Copy, Eye, FileText, Loader2, Mail, MoreHorizontal, RotateCcw, Search, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { TransactionService } from '@/services/transaction-service';
import { AuthService } from '@/services/auth-service';
import type { TransactionStatementItem } from '@/services/transaction-service';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface TransactionStatementTableProps {
  transactions: TransactionStatementItem[];
  isLoading?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
  sortField: 'createdAt' | 'amount';
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: 'createdAt' | 'amount') => void;
  page: number;
  totalPages: number;
  onPrevPage: () => void;
  onNextPage: () => void;
  isPaging?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const normalizeBrand = (brand: string | null) => {
  if (!brand) return '--';
  const cleaned = brand.replace(/\*/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  if (!cleaned) return '--';

  const known = ['VISA', 'MASTERCARD', 'MASTER', 'ELO', 'AMEX', 'AMERICAN EXPRESS', 'HIPER'];
  const match = known.find((k) => cleaned.includes(k));
  if (match) return match === 'AMERICAN EXPRESS' ? 'AMEX' : match === 'MASTER' ? 'MASTERCARD' : match;

  const parts = cleaned.split(' ');
  return parts[parts.length - 1] || '--';
};

const BrandCell = ({ brand }: { brand: string | null }) => {
  const brandLabel = normalizeBrand(brand);

  const b = brandLabel.toLowerCase();
  const isVisa = b.includes('visa');
  const isMaster = b.includes('master');
  const isElo = b.includes('elo');
  const isAmex = b.includes('amex');
  const isHiper = b.includes('hiper');

  const iconBg = isVisa
    ? 'bg-[#1A1F71]'
    : isMaster
      ? 'bg-[#EB001B]'
      : isElo
        ? 'bg-[#00AEEF]'
        : isAmex
          ? 'bg-[#007BC1]'
          : isHiper
            ? 'bg-[#ED1C24]'
            : 'bg-slate-500';

  const iconText = isMaster ? 'MC' : brandLabel.length > 6 ? brandLabel.slice(0, 6) : brandLabel;

  return (
    <div className={cn("w-9 h-5 rounded-md flex items-center justify-center text-[9px] text-white font-bold italic", iconBg)} title={brandLabel}>
        {iconText}
    </div>
  );
};

const CardLastFourCell = ({ lastFour }: { lastFour: string | null }) => {
  const rawLastFour = lastFour ?? '';
  const digitsOnly = rawLastFour.replace(/\D/g, '');
  const safeLastFour = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : '----';
  return <span className="text-xs text-muted-foreground font-mono">**** **** **** {safeLastFour}</span>;
};

const parseDateTime = (value: unknown): Date | null => {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'number') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) {
      const asNumber = Number(trimmed);
      const d = new Date(asNumber);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
      const normalized = trimmed.replace(' ', 'T');
      const d = new Date(normalized);
      return Number.isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  return null;
};

const formatDateTime = (value: unknown) => {
  const date = parseDateTime(value);
  if (!date) return '--/--/---- --:--';

  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const statusUI: Record<
  'CAPTURED' | 'AUTHORIZED' | 'DENIED' | 'REFUNDED' | 'FAILED' | 'UNKNOWN',
  { label: string; className: string; Icon: React.ComponentType<{ size?: number }> }
> = {
  CAPTURED: {
    label: 'Capturado',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Icon: CheckCircle2,
  },
  AUTHORIZED: {
    label: 'Autorizado',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    Icon: Clock,
  },
  DENIED: {
    label: 'Negado',
    className: 'bg-rose-100 text-rose-800 border-rose-200',
    Icon: XCircle,
  },
  REFUNDED: {
    label: 'Estornado',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    Icon: Clock,
  },
  FAILED: {
    label: 'Falha',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    Icon: XCircle,
  },
  UNKNOWN: {
    label: 'Indefinido',
    className: 'bg-gray-100 text-gray-800 border-gray-200',
    Icon: Clock,
  },
};

function normalizeStatus(status: string): keyof typeof statusUI {
  const s = status.trim().toUpperCase();

  if (s.includes('CAPTURED') || s.includes('CAPTURADO') || s.includes('APPROVED')) return 'CAPTURED';
  if (s.includes('AUTHORIZED') || s.includes('AUTORIZADO')) return 'AUTHORIZED';
  if (s.includes('DENIED') || s.includes('NEGADO') || s.includes('REJECTED')) return 'DENIED';
  if (s.includes('REFUNDED') || s.includes('ESTORNADO')) return 'REFUNDED';
  if (s.includes('FAILED') || s.includes('FALHA') || s.includes('ERROR')) return 'FAILED';

  return 'UNKNOWN';
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const config = statusUI[normalized] ?? statusUI.UNKNOWN;
  const Icon = config.Icon;
  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border', config.className)}>
      <Icon size={12} />
      {config.label}
    </div>
  );
}

function TransactionIdCell({ tx }: { tx: TransactionStatementItem }) {
  const { toast } = useToast();
  const displayId = tx.externalId;
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(displayId);
  const displayShort = isUuid ? `${displayId.slice(0, 8)}…${displayId.slice(-4)}` : displayId;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-semibold text-slate-900">{displayShort}</span>
      <Tooltip.Provider delayDuration={150}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <button
              type="button"
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
              aria-label="Copiar ID"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(displayId);
                  toast({ title: 'Copiado!', description: `ID ${displayId} copiado.`, variant: 'success' });
                } catch {
                  toast({ title: 'Erro', description: 'Não foi possível copiar.', variant: 'destructive' });
                }
              }}
            >
              <Copy size={14} className="text-muted-foreground" />
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content side="top" align="center" className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg">
              Copiar
              <Tooltip.Arrow className="fill-slate-900" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
    </div>
  );
}

function TransactionRowActions({ tx }: { tx: TransactionStatementItem }) {
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isRefundOpen, setIsRefundOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [emailApiError, setEmailApiError] = useState<string | undefined>(undefined);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isRefunding, setIsRefunding] = useState(false);

  const prettyJson = useMemo(() => JSON.stringify(tx, null, 2), [tx]);

  const merchantId = AuthService.getMerchantId() ?? '';
  const normalizedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail);

  const handleOpenReceipt = () => {
    const url = new URL(`/receipt/${tx.id}`, window.location.origin);
    url.searchParams.set('externalId', tx.externalId);
    url.searchParams.set('nsu', tx.nsu);
    url.searchParams.set('amount', String(tx.amount));
    url.searchParams.set('status', String(tx.status));
    if (tx.brand) url.searchParams.set('brand', tx.brand);
    if (tx.lastFour) url.searchParams.set('lastFour', tx.lastFour);
    url.searchParams.set('createdAt', tx.createdAt);
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  const handleSendEmail = async () => {
    setEmailTouched(true);
    setEmailApiError(undefined);
    if (!isEmailValid) return;

    setIsSendingEmail(true);
    try {
      const status = await TransactionService.sendReceiptEmail(tx.id, normalizedEmail, merchantId || undefined);
      if (status === 200 || status === 202) {
        toast({
          title: 'E-mail enviado',
          description: `Comprovante enviado com sucesso para ${normalizedEmail}!`,
          variant: 'success',
        });
        setIsEmailOpen(false);
        setEmail('');
        setEmailTouched(false);
        setEmailApiError(undefined);
        return;
      }

      setEmailApiError('Não foi possível enviar o e-mail.');
      return;
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'friendlyMessage' in err && typeof (err as { friendlyMessage?: unknown }).friendlyMessage === 'string'
          ? (err as { friendlyMessage: string }).friendlyMessage
          : 'Não foi possível enviar o e-mail.';
      setEmailApiError(message);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleRefund = async () => {
    setIsRefunding(true);
    try {
      await TransactionService.requestRefund(tx.id);
      toast({ title: 'Estorno solicitado', description: 'A solicitação foi enviada para processamento.', variant: 'success' });
      setIsRefundOpen(false);
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'friendlyMessage' in err && typeof (err as { friendlyMessage?: unknown }).friendlyMessage === 'string'
          ? (err as { friendlyMessage: string }).friendlyMessage
          : 'Não foi possível solicitar o estorno.';
      toast({ title: 'Falha no estorno', description: message, variant: 'destructive' });
    } finally {
      setIsRefunding(false);
    }
  };

  return (
    <>
      <Tooltip.Provider delayDuration={200}>
        <Tooltip.Root>
          <DropdownMenu.Root>
            <Tooltip.Trigger asChild>
              <DropdownMenu.Trigger asChild>
                <button className="p-2 hover:bg-muted rounded-full transition-colors" aria-label="Ações">
                  <MoreHorizontal size={18} className="text-muted-foreground" />
                </button>
              </DropdownMenu.Trigger>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content side="top" align="center" className="bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg">
                Ações
                <Tooltip.Arrow className="fill-slate-900" />
              </Tooltip.Content>
            </Tooltip.Portal>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={8}
                className="min-w-56 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/60 overflow-hidden"
              >
                <DropdownMenu.Item
                  onSelect={() => setIsDetailsOpen(true)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
                >
                  <Eye size={16} className="text-slate-500" />
                  Ver Detalhes
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={handleOpenReceipt}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
                >
                  <FileText size={16} className="text-slate-500" />
                  Comprovante
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onSelect={() => {
                    setEmail('');
                    setEmailTouched(false);
                    setEmailApiError(undefined);
                    setIsEmailOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 outline-none cursor-pointer"
                >
                  <Mail size={16} className="text-slate-500" />
                  Enviar por E-mail
                </DropdownMenu.Item>

                <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />

                <DropdownMenu.Item
                  onSelect={() => setIsRefundOpen(true)}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 outline-none cursor-pointer"
                >
                  <RotateCcw size={16} className="text-red-500" />
                  Solicitar Estorno
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </Tooltip.Root>
      </Tooltip.Provider>

      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-[520px]">
          <SheetHeader>
            <SheetTitle>Detalhes da Transação</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="bg-muted/30 border border-border rounded-xl p-4">
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">JSON</div>
              <pre className="mt-3 text-xs font-mono text-primary overflow-auto whitespace-pre-wrap break-words">{prettyJson}</pre>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Enviar comprovante por e-mail</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSendEmail();
            }}
          >
            {emailApiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">
                {emailApiError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">E-mail do portador</label>
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailTouched(true);
                  setEmailApiError(undefined);
                }}
                placeholder="email@exemplo.com"
                type="email"
                autoFocus
                disabled={isSendingEmail}
                className={cn(
                  "w-full px-4 py-3 bg-muted/40 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm disabled:opacity-60",
                  emailTouched && normalizedEmail.length > 0 && !isEmailValid
                    ? "border-red-300 focus:ring-red-500/20"
                    : "border-input focus:ring-primary/20"
                )}
              />
              {emailTouched && normalizedEmail.length > 0 && !isEmailValid && (
                <div className="text-[11px] font-bold text-red-600">E-mail inválido</div>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsEmailOpen(false)}
                className="px-4 py-2 border border-input rounded-xl hover:bg-muted transition-colors text-sm font-bold"
                disabled={isSendingEmail}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!normalizedEmail || !isEmailValid || isSendingEmail}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSendingEmail && <Loader2 size={16} className="animate-spin" />}
                {isSendingEmail ? 'Enviando...' : 'Enviar'}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isRefundOpen} onOpenChange={setIsRefundOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar solicitação de estorno?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRefund} disabled={isRefunding} className="bg-red-600 hover:bg-red-700">
              Solicitar Estorno
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <div className="p-4 border-b border-border bg-muted/20">
        <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
      </div>
      <div className="p-6 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-muted/30 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export function TransactionStatementTable({
  transactions,
  isLoading,
  searchValue,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  page,
  totalPages,
  onPrevPage,
  onNextPage,
  isPaging,
}: TransactionStatementTableProps) {
  const safeSortField = sortField ?? 'createdAt';
  const safeSortDirection = sortDirection ?? 'desc';
  const safeOnSortChange =
    typeof onSortChange === 'function' ? onSortChange : () => undefined;

  const sortIcon = (field: 'createdAt' | 'amount') => {
    if (safeSortField !== field) return <ArrowUpDown size={14} className="text-muted-foreground" />;
    return safeSortDirection === 'asc' ? (
      <ChevronUp size={14} className="text-slate-900" />
    ) : (
      <ChevronDown size={14} className="text-slate-900" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Busca com debounce é feita no Hook, aqui só controlamos o input */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input
            type="text"
            placeholder="Buscar por NSU..."
            className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Atualização automática</span>
        </div>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transação</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => safeOnSortChange('createdAt')}
                      className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      aria-label="Ordenar por Data/Hora"
                    >
                      Data/Hora
                      {sortIcon('createdAt')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => safeOnSortChange('amount')}
                      className="inline-flex items-center gap-1.5 hover:text-slate-900 transition-colors"
                      aria-label="Ordenar por Valor Bruto"
                    >
                      Valor Bruto
                      {sortIcon('amount')}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bandeira</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cartão</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">NSU</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      {/* Requisito: exibir externalId (no modelo atual: external_id) */}
                      <td className="px-6 py-4">
                        <TransactionIdCell tx={tx} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-muted-foreground">
                        {formatDateTime(tx.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <BrandCell brand={tx.brand} />
                      </td>
                      <td className="px-6 py-4">
                        <CardLastFourCell lastFour={tx.lastFour} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={String(tx.status)} />
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                        {tx.nsu}
                      </td>
                      <td className="px-6 py-4">
                        <TransactionRowActions tx={tx} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Search size={48} className="opacity-20 mb-2" />
                        <p className="font-semibold text-primary">Nenhuma transação encontrada</p>
                        <p className="text-sm">Tente ajustar sua busca por NSU.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação Spring Data */}
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Página {totalPages === 0 ? 0 : page + 1} de {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onPrevPage}
                disabled={page <= 0}
                className="px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-bold disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={onNextPage}
                disabled={totalPages === 0 || page >= totalPages - 1}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold disabled:opacity-50"
              >
                Próximo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
