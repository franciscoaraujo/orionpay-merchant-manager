'use client';

import React, { useState, useMemo, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Settlement } from '@/types';
import { AuthService } from '@/services/auth-service';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Wallet,
  Download,
  ShieldCheck,
  Search,
  CircleDollarSign,
  AlertCircle,
  ChevronDown,
  Lock,
  X,
  CreditCard,
  Hash,
  ShieldAlert,
  Upload,
  FileText,
  Check,
  Loader2,
  Trash2,
  MoreHorizontal,
  Eye,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// --- Modal de Contestação (Stepper Completo Restaurado) ---
interface DisputeModalProps {
  settlement: Settlement;
  onClose: () => void;
  onSuccess: () => void;
}

const DisputeModal = ({ settlement, onClose, onSuccess }: DisputeModalProps) => {
  const [step, setStep] = useState(1);
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const disputeReasons = [
    { id: 'FRAUD', label: 'Fraude Suspeita' },
    { id: 'NOT_DELIVERED', label: 'Mercadoria Não Entregue' },
    { id: 'SERVICE_NOT_PROVIDED', label: 'Serviço Não Prestado' },
    { id: 'AMOUNT_ERROR', label: 'Erro no Valor Cobrado' },
    { id: 'DUPLICATE', label: 'Cobrança Duplicada' }
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    setUploadProgress(20);
    
    // Simulação do Fluxo Completo de Upload
    setTimeout(() => {
      setUploadProgress(60);
      setTimeout(() => {
        setUploadProgress(100);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 500);
      }, 1000);
    }, 1000);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-card border border-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-6 pb-4 flex justify-between items-start border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div className="text-left">
              <h2 className="text-lg font-bold text-primary tracking-tight">Contestação Preventiva</h2>
              <p className="text-[10px] text-muted-foreground font-bold font-mono tracking-widest uppercase">
                ID: optr_{settlement.id.slice(-10).toUpperCase()}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full text-muted-foreground transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Stepper Progress */}
        <div className="px-8 pt-6 flex items-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all",
                step >= s ? "bg-[#0A2540] text-white shadow-lg" : "bg-muted text-muted-foreground"
              )}>
                {step > s ? <Check size={12} /> : s}
              </div>
              <div className={cn("h-0.5 flex-1 rounded-full", step > s ? "bg-[#0A2540]" : "bg-muted")} />
            </div>
          ))}
        </div>

        {/* Form Content */}
        <div className="p-8 min-h-[350px]">
          
          {/* Passo 1: Motivo */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-3 text-left">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Qual o motivo da disputa?</label>
                <div className="relative group">
                  <select
                    className="w-full bg-muted/30 border border-input rounded-xl p-4 pr-12 text-sm font-medium text-primary appearance-none focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    <option value="" disabled>Selecione uma opção...</option>
                    {disputeReasons.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-all" />
                </div>
              </div>
              <div className="space-y-2 text-left">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Observações Adicionais</label>
                <textarea 
                  className="w-full bg-muted/30 border border-input rounded-xl p-4 focus:ring-2 focus:ring-primary/10 h-28 text-sm text-primary"
                  placeholder="Explique detalhadamente o ocorrido (Opcional)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Passo 2: Provas */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-primary">Anexar Provas de Defesa</h3>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-tight">NF-e, Comprovante de Entrega ou conversas no WhatsApp</p>
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-3 bg-muted/10 hover:bg-muted/20 transition-all cursor-pointer group"
              >
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-muted-foreground group-hover:text-primary shadow-sm transition-all border border-border">
                  <Upload size={24} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-primary">Clique para selecionar arquivos</p>
                  <p className="text-[10px] text-muted-foreground font-bold tracking-tight">PDF, PNG, JPG (Máx. 10MB)</p>
                </div>
                <input type="file" multiple hidden ref={fileInputRef} onChange={handleFileChange} />
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                {files.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <FileText size={16} className="text-muted-foreground" />
                      <span className="text-xs font-bold text-primary truncate max-w-[200px]">{f.name}</span>
                    </div>
                    <button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Passo 3: Resumo */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 text-left">
              <div className="bg-muted/30 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border pb-3">
                  <span>Resumo da Transação</span>
                  <span className="text-primary">Defesa Prévia</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Valor</span>
                    <p className="text-sm font-bold text-primary">{formatCurrency(settlement.amount_net)}</p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-muted-foreground font-bold uppercase">Data Liq.</span>
                    <p className="text-sm font-bold text-primary">{format(parseISO(settlement.settlement_date), 'dd/MM/yyyy')}</p>
                  </div>
                </div>
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] text-muted-foreground font-bold uppercase">Motivo da Disputa</span>
                  <p className="text-sm font-bold text-amber-600 uppercase tracking-tight">{disputeReasons.find(r => r.id === reason)?.label}</p>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-700 p-4 rounded-xl flex items-center gap-3 border border-emerald-100">
                <CheckCircle2 size={20} />
                <p className="text-[10px] font-bold leading-relaxed">
                  Você está anexando <strong>{files.length} documento(s)</strong> de defesa. Isso aumenta significativamente a chance de evitar o Chargeback definitivo pelo banco.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="px-8 pb-4 space-y-2 animate-in fade-in">
            <div className="flex justify-between text-[10px] font-bold text-primary uppercase">
              <span>Sincronizando Provas...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${uploadProgress}%` }} />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-8 pt-0 flex gap-3">
          {step > 1 && !isUploading && (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="px-6 py-3 border border-input rounded-xl text-xs font-bold hover:bg-muted transition-all text-muted-foreground uppercase tracking-widest"
            >
              Voltar
            </button>
          )}
          
          <button 
            disabled={isUploading || (step === 1 && !reason) || (step === 2 && files.length === 0)}
            onClick={() => {
              if (step < 3) setStep(s => s + 1);
              else handleSubmit();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-30 transition-all shadow-md uppercase tracking-widest"
          >
            {isUploading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : step === 3 ? (
              <>Enviar Contestação <ArrowRight size={16} /></>
            ) : (
              'Próximo Passo'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SettlementPage() {
  const queryClient = useQueryClient();
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 3, 1));
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;
  
  const [selectedSettlementId, setSelectedSettlementId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [settlementToDispute, setSettlementToDispute] = useState<Settlement | null>(null);

  const merchantId = AuthService.getMerchantId();

  const { data, isLoading } = useQuery({
    queryKey: ['agenda', format(currentMonth, 'M'), format(currentMonth, 'yyyy'), merchantId, page],
    queryFn: async () => {
      if (!merchantId) return { items: [], summary: { totalGrossAmount: 0, totalCommittedAmount: 0, totalAvailableAmount: 0 }, totalPages: 0, totalElements: 0 };
      const response = await api.get(`/merchants/${merchantId}/agenda`, { params: { year: format(currentMonth, 'yyyy'), month: format(currentMonth, 'M'), page, size: pageSize } });
      const items = (response.data.items || []).map((item: any) => ({
        id: item.idExt,
        transaction_id: item.idExt,
        settlement_date: item.settlementDate,
        amount_gross: item.grossAmount,
        amount_net: item.netAmount,
        fee_mdr: item.mdrAmount,
        status: item.status === 'PAGO' ? 'PAID' : item.status === 'AGENDADO' ? 'SCHEDULED' : item.status,
        ownership_status: item.titularidade === 'DISPONÍVEL' ? 'AVAILABLE' : 'LINKED_TO_GUARANTEE',
        bank_name: item.cardBrand || 'Card'
      })) as Settlement[];
      return { items, summary: response.data.summary, totalPages: response.data.totalPages || 0, totalElements: response.data.totalElements || 0 };
    },
    enabled: !!merchantId,
  });

  const { data: detail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['settlement-detail', selectedSettlementId],
    queryFn: async () => {
      if (!selectedSettlementId) return null;
      const response = await api.get(`/merchants/agenda/${selectedSettlementId}/detail`);
      return response.data;
    },
    enabled: !!selectedSettlementId && isModalOpen,
  });

  const settlements = data?.items || [];
  const summary = data?.summary || { totalGrossAmount: 0, totalCommittedAmount: 0, totalAvailableAmount: 0 };
  const filteredData = useMemo(() => settlements.filter(s => s.id.toLowerCase().includes(searchTerm.toLowerCase())), [settlements, searchTerm]);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <MainLayout>
      <div className="space-y-6 animate-in fade-in pb-20">
        
        {/* Header Section */}
        <div className="flex justify-between items-end">
          <div className="space-y-1 text-left">
            <h2 className="text-xl font-bold text-primary tracking-tight">Agenda Financeira</h2>
            <p className="text-muted-foreground text-sm">Acompanhe suas liquidações e recebíveis.</p>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-xl">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-card rounded-lg transition-all shadow-sm"><ChevronLeft size={16} /></button>
            <span className="px-4 text-xs font-bold text-primary capitalize">{format(currentMonth, "MMMM yyyy", { locale: ptBR })}</span>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-card rounded-lg transition-all shadow-sm"><ChevronRight size={16} /></button>
          </div>
        </div>

        {/* KPIs Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-[#0A2540] border border-border p-6 rounded-xl shadow-sm text-white">
            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block mb-1">Total Agenda</span>
            <span className="text-2xl font-bold tracking-tight">{formatCurrency(summary.totalGrossAmount)}</span>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Comprometido</span>
            <span className="text-2xl font-bold text-amber-600 tracking-tight">{formatCurrency(summary.totalCommittedAmount)}</span>
          </div>
          <div className="bg-card border border-border p-6 rounded-xl shadow-sm">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Livre p/ Antecipar</span>
            <span className="text-2xl font-bold text-emerald-600 tracking-tight">{formatCurrency(summary.totalAvailableAmount)}</span>
          </div>
        </div>

        {/* Search Section */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm text-left">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <input type="text" placeholder="Pesquisar por ID..." className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-lg text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-bold text-muted-foreground uppercase tracking-widest">
            <Download size={16} /> Exportar CSV
          </button>
        </div>

        {/* Main Table */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Transação / Data</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Bruto</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxas</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Líquido</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data Liquidação</th>
                  <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={6} className="px-6 py-6"><div className="h-4 bg-muted/50 rounded-full w-full" /></td></tr>) : filteredData.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-muted/50 rounded-lg flex flex-col items-center justify-center border border-border shadow-sm">
                          <span className="text-[8px] font-bold text-muted-foreground uppercase">{format(parseISO(s.settlement_date), 'MMM', { locale: ptBR })}</span>
                          <span className="text-xs font-bold text-primary">{format(parseISO(s.settlement_date), 'dd')}</span>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">optr_{s.id.slice(-10).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">{formatCurrency(s.amount_gross)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-rose-600">-{formatCurrency(s.fee_mdr)}</td>
                    <td className="px-6 py-4 text-sm font-bold text-primary">{formatCurrency(s.amount_net)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-muted-foreground">{format(parseISO(s.settlement_date), 'dd/MM/yyyy')}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger asChild>
                          <button className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"><MoreHorizontal size={18} /></button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content align="end" sideOffset={8} className="min-w-52 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-[150] animate-in fade-in zoom-in-95">
                            <DropdownMenu.Item onSelect={() => { setSelectedSettlementId(s.id); setIsModalOpen(true); }} className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 outline-none cursor-pointer">
                              <Eye size={16} className="text-slate-500" /> Ver Detalhes
                            </DropdownMenu.Item>
                            <DropdownMenu.Item onSelect={() => { setSettlementToDispute(s); setIsDisputeModalOpen(true); }} className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-amber-600 hover:bg-amber-50 outline-none cursor-pointer">
                                <ShieldAlert size={16} className="text-amber-500" /> Contestar Transação
                            </DropdownMenu.Item>
                            <DropdownMenu.Separator className="h-px bg-slate-100 my-1" />
                            <DropdownMenu.Item className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 outline-none cursor-pointer">
                              <Download size={16} className="text-slate-500" /> Baixar Comprovante
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-border flex items-center justify-between bg-muted/10">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-left">Página {page + 1} de {data?.totalPages || 1}</div>
            <div className="flex gap-2">
              <button disabled={page <= 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border border-input rounded-lg text-xs font-bold disabled:opacity-50 transition-all hover:bg-muted">Anterior</button>
              <button disabled={page >= (data?.totalPages || 1) - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold disabled:opacity-50 transition-all hover:opacity-90">Próximo</button>
            </div>
          </div>
        </div>

        {/* Modal de Detalhes */}
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in transition-all text-left">
            <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-primary tracking-tight">Detalhes</h3>
                  <p className="text-[10px] font-mono text-muted-foreground font-bold tracking-widest uppercase">optr_{selectedSettlementId?.slice(-10).toUpperCase()}</p>
                  {detail && (
                    <div className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold border mt-2",
                      detail.titularidade === 'DISPONÍVEL' ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                    )}>
                      {detail.titularidade === 'DISPONÍVEL' ? 'LIVRE PARA USO' : 'TRAVADO EM GARANTIA'}
                    </div>
                  )}
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-muted rounded-full transition-all text-muted-foreground"><X size={20} /></button>
              </div>
              {isLoadingDetail ? <Loader2 className="animate-spin mx-auto my-12 text-primary/20" /> : detail && (
                <div className="space-y-6">
                  <div className="bg-muted/30 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between text-sm font-medium"><span className="text-muted-foreground">Bruto</span><span className="text-emerald-600 font-bold">+{formatCurrency(detail.grossAmount)}</span></div>
                    <div className="flex justify-between text-sm font-medium"><span className="text-muted-foreground">Taxa MDR</span><span className="text-rose-600 font-bold">-{formatCurrency(detail.mdrAmount)}</span></div>
                    <div className="h-px bg-border my-2" />
                    <div className="flex justify-between text-base font-bold text-primary"><span>Líquido</span><span>{formatCurrency(detail.netAmount)}</span></div>
                  </div>
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex items-center gap-2">
                    <ShieldCheck size={16} className="text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-tight">NSU: {detail.nsu} • Parcela {detail.installmentLabel}</span>
                  </div>
                  <button className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-sm hover:opacity-90 flex items-center justify-center gap-2 transition-all"><Download size={18} /> Baixar PDF</button>
                </div>
              )}
            </div>
          </div>
        )}

        {isDisputeModalOpen && settlementToDispute && <DisputeModal settlement={settlementToDispute} onClose={() => setIsDisputeModalOpen(false)} onSuccess={() => queryClient.invalidateQueries({ queryKey: ['agenda'] })} />}
      </div>
    </MainLayout>
  );
}
