'use client';

import React, { useEffect, useMemo } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Printer, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTransactionReceipt } from '@/hooks/use-transaction-receipt';

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

const normalizeBrand = (brand?: string) => {
  if (!brand) return '--';
  const cleaned = brand.replace(/\*/g, ' ').replace(/\s+/g, ' ').trim().toUpperCase();
  if (!cleaned) return '--';
  const known = ['VISA', 'MASTERCARD', 'MASTER', 'ELO', 'AMEX', 'AMERICAN EXPRESS', 'HIPER'];
  const match = known.find((k) => cleaned.includes(k));
  if (match) return match === 'AMERICAN EXPRESS' ? 'AMEX' : match === 'MASTER' ? 'MASTERCARD' : match;
  const parts = cleaned.split(' ');
  return parts[parts.length - 1] || '--';
};

const normalizeLastFour = (lastFour?: string) => {
  const digitsOnly = (lastFour ?? '').replace(/\D/g, '');
  return digitsOnly.length >= 4 ? digitsOnly.slice(-4) : '----';
};

const BrandPill = ({ brand }: { brand: string }) => {
  const b = brand.toLowerCase();
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

  const iconText = isMaster ? 'MC' : brand.length > 6 ? brand.slice(0, 6) : brand;

  return (
    <div className={`${iconBg} w-10 h-6 rounded-md flex items-center justify-center text-[10px] text-white font-bold italic`}>
      {iconText}
    </div>
  );
};

export default function ReceiptPage() {
  const routeParams = useParams<{ transactionId: string }>();
  const transactionId = routeParams?.transactionId;
  const sp = useSearchParams();

  const searchParams = useMemo(() => {
    const get = (key: string) => sp.get(key) ?? undefined;
    return {
      externalId: get('externalId'),
      nsu: get('nsu'),
      amount: get('amount'),
      status: get('status'),
      brand: get('brand'),
      lastFour: get('lastFour'),
      createdAt: get('createdAt'),
    };
  }, [sp]);

  const router = useRouter();
  const { toast } = useToast();

  const receiptQuery = useTransactionReceipt(transactionId ?? '');

  const errorStatus = useMemo(() => {
    const err = receiptQuery.error as unknown;
    if (typeof err !== 'object' || err === null) return undefined;
    if (!('response' in err)) return undefined;
    const response = (err as { response?: unknown }).response;
    if (typeof response !== 'object' || response === null) return undefined;
    const status = (response as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }, [receiptQuery.error]);

  const errorMessage = useMemo(() => {
    const err = receiptQuery.error as unknown;
    if (typeof err !== 'object' || err === null) return undefined;
    if (!('friendlyMessage' in err)) return undefined;
    const message = (err as { friendlyMessage?: unknown }).friendlyMessage;
    return typeof message === 'string' ? message : undefined;
  }, [receiptQuery.error]);

  useEffect(() => {
    if (!receiptQuery.isError) return;
    if (errorStatus === 404) {
      toast({
        title: 'Erro',
        description: errorMessage ?? 'Comprovante não encontrado ou sem permissão',
        variant: 'destructive',
      });
      router.replace('/transactions');
    }
  }, [errorMessage, errorStatus, receiptQuery.isError, router, toast]);

  const data = receiptQuery.data;

  const amount = typeof data?.amount === 'number' ? data.amount : Number(searchParams.amount ?? 0);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(safeAmount);

  const createdAtLabel = formatDateTime(data?.createdAt ?? searchParams.createdAt);
  const brandLabel = normalizeBrand(data?.brand ?? searchParams.brand);
  const lastFourLabel = normalizeLastFour(data?.lastFour ?? searchParams.lastFour);
  const nsuLabel = data?.nsu ?? searchParams.nsu ?? '--';
  const statusLabel = data?.status ?? searchParams.status ?? '--';
  const externalIdLabel = data?.externalId ?? searchParams.externalId ?? transactionId ?? '--';

  useEffect(() => {
    document.title = `Comprovante - ${externalIdLabel}`;
  }, [externalIdLabel]);

  return (
    <div className="min-h-screen bg-white text-slate-900 px-4 py-10 print:p-0">
      <style jsx global>{`
        @media print {
          body {
            background: #fff !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
      <div className="max-w-[720px] mx-auto">
        <div className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#0A2540] flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-[#0A2540] tracking-tight">OrionPay</span>
              <span className="text-[11px] text-slate-500 font-medium">Comprovante de transação</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            <Printer size={16} />
            Imprimir
          </button>
        </div>

        <div className="mt-8 border border-slate-100 rounded-[24px] shadow-sm overflow-hidden">
          <div className="px-8 py-6 bg-slate-50 border-b border-slate-100">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transação</div>
                <div className="text-2xl font-bold tracking-tight text-slate-900">
                  {externalIdLabel}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Valor</div>
                <div className="text-2xl font-bold tracking-tight text-[#0A2540]">
                  {receiptQuery.isLoading ? <div className="h-8 w-28 bg-slate-200 rounded-lg animate-pulse" /> : formattedAmount}
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">NSU</div>
              <div className="mt-1 text-sm font-bold text-slate-900 font-mono">
                {receiptQuery.isLoading ? <div className="h-5 w-32 bg-slate-200 rounded-md animate-pulse" /> : nsuLabel}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Data/Hora</div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {receiptQuery.isLoading ? <div className="h-5 w-40 bg-slate-200 rounded-md animate-pulse" /> : createdAtLabel}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</div>
              <div className="mt-1 text-sm font-bold text-slate-900">
                {receiptQuery.isLoading ? <div className="h-5 w-28 bg-slate-200 rounded-md animate-pulse" /> : statusLabel}
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-4">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Bandeira / Cartão</div>
              <div className="mt-1 text-sm font-bold text-slate-900 flex items-center gap-3">
                {receiptQuery.isLoading ? (
                  <>
                    <div className="h-5 w-16 bg-slate-200 rounded-md animate-pulse" />
                    <div className="h-5 w-32 bg-slate-200 rounded-md animate-pulse" />
                  </>
                ) : (
                  <>
                    <BrandPill brand={brandLabel} />
                    <span className="text-slate-500 font-mono">**** **** **** {lastFourLabel}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-slate-100 bg-white">
            <div className="text-[11px] text-slate-500 font-medium">
              ID interno: <span className="font-mono text-slate-700">{transactionId ?? '--'}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-[10px] text-slate-400 font-medium print:hidden">
          Este comprovante é gerado para fins de conferência. Em caso de divergência, consulte o suporte OrionPay.
        </div>
      </div>
    </div>
  );
}
