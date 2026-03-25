'use client';

import React, { useMemo, useState } from 'react';
import { Loader2, Wallet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { WithdrawalService } from '@/services/withdrawal-service';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useDashboardRevalidator } from '@/hooks/use-dashboard';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const parseCurrencyToNumber = (value: string) => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return 0;
  const cents = Number(digits);
  if (!Number.isFinite(cents)) return 0;
  return cents / 100;
};

const formatCurrencyInput = (raw: string) => {
  const value = parseCurrencyToNumber(raw);
  return formatCurrency(value);
};

export function WithdrawModal({
  open,
  onOpenChange,
  merchantId,
  availableBalance,
  totalBalance,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  merchantId: string;
  availableBalance: number;
  totalBalance: number;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const revalidateDashboard = useDashboardRevalidator();

  const [amountInput, setAmountInput] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [touched, setTouched] = useState(false);
  const [apiError, setApiError] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const amount = useMemo(() => parseCurrencyToNumber(amountInput), [amountInput]);
  const exceedsBalance = amount > availableBalance;
  const futureBalance = Math.max(totalBalance - availableBalance, 0);
  const isPixKeyValid = pixKey.trim().length > 0;
  const isAmountValid = amount > 0 && !exceedsBalance;
  const canSubmit = !!merchantId && isAmountValid && isPixKeyValid && !isSubmitting;

  const resetState = () => {
    setAmountInput('');
    setPixKey('');
    setTouched(false);
    setApiError(undefined);
    setIsSubmitting(false);
    setIsSuccess(false);
  };

  const handleSubmit = async () => {
    setTouched(true);
    setApiError(undefined);
    if (!canSubmit) return;

    setIsSubmitting(true);
    try {
      const status = await WithdrawalService.requestWithdrawal(merchantId, amount, pixKey.trim());
      if (status === 200 || status === 201 || status === 202) {
        setIsSuccess(true);
        revalidateDashboard(merchantId);
        queryClient.invalidateQueries({ queryKey: ['transaction-statement', merchantId] });
        queryClient.invalidateQueries({ queryKey: ['transactions-latest', merchantId] });
        return;
      }
      setApiError('Não foi possível enviar a solicitação de saque.');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'friendlyMessage' in err && typeof (err as { friendlyMessage?: unknown }).friendlyMessage === 'string'
          ? (err as { friendlyMessage: string }).friendlyMessage
          : 'Não foi possível enviar a solicitação de saque.';
      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) resetState();
      }}
    >
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Solicitação de Saque</DialogTitle>
        </DialogHeader>

        {isSuccess ? (
          <div className="space-y-5">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <div className="text-sm font-bold text-emerald-900">Solicitação de saque enviada com sucesso!</div>
              <div className="text-sm text-emerald-800 font-medium mt-1">
                O valor cairá na sua conta em instantes.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  toast({ title: 'Solicitação enviada', description: 'Saque em processamento.', variant: 'success' });
                  onOpenChange(false);
                }}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-bold"
              >
                Fechar
              </button>
            </div>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="bg-muted/30 border border-border rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">
                  <Wallet size={18} className="text-slate-700" />
                </div>
                <div className="space-y-1">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Saldo Total</div>
                  <div className="text-sm font-bold text-slate-700">{formatCurrency(totalBalance)}</div>
                  <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
                    Saldo Disponível para Saque
                  </div>
                  <div className="text-2xl font-bold text-slate-900 tracking-tight">{formatCurrency(availableBalance)}</div>
                </div>
              </div>
            </div>

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-xl px-4 py-3">
                {apiError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Valor do Saque</label>
              <input
                value={amountInput}
                onChange={(e) => {
                  setTouched(true);
                  setApiError(undefined);
                  setAmountInput(formatCurrencyInput(e.target.value));
                }}
                inputMode="numeric"
                placeholder="R$ 0,00"
                className={cn(
                  "w-full px-4 py-3 bg-muted/40 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm",
                  touched && exceedsBalance ? "border-red-300 focus:ring-red-500/20" : "border-input focus:ring-primary/20"
                )}
              />
              {touched && exceedsBalance && (
                <div className="text-[11px] font-bold text-red-600">
                  Você possui {formatCurrency(futureBalance)} de saldo futuro que ainda não está liberado para saque
                </div>
              )}
              <div className="text-[11px] text-muted-foreground font-medium">
                Lembre-se: Vendas no Débito liberam em 1 dia útil e Crédito em 30 dias
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Chave Pix</label>
              <input
                value={pixKey}
                onChange={(e) => {
                  setTouched(true);
                  setApiError(undefined);
                  setPixKey(e.target.value);
                }}
                placeholder="Digite sua chave Pix"
                className={cn(
                  "w-full px-4 py-3 bg-muted/40 border rounded-xl focus:outline-none focus:ring-2 transition-all text-sm",
                  touched && !isPixKeyValid ? "border-red-300 focus:ring-red-500/20" : "border-input focus:ring-primary/20"
                )}
              />
              {touched && !isPixKeyValid && (
                <div className="text-[11px] font-bold text-red-600">Informe uma chave Pix</div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-5 py-2.5 border border-input rounded-xl hover:bg-muted transition-colors text-sm font-bold"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!canSubmit}
                className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-bold disabled:opacity-50 inline-flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? 'Enviando...' : 'Confirmar Saque'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
