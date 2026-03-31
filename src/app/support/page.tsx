'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  LifeBuoy, 
  Plus, 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Eye,
  ChevronRight,
  Send,
  Paperclip,
  ArrowRight,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { useToast } from '@/hooks/use-toast';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'OPEN' | 'ANALYSIS' | 'ANSWERED' | 'CLOSED';
  lastUpdate: string;
  hasNewMessage: boolean;
  messages: Message[];
}

interface Message {
  id: string;
  sender: 'USER' | 'SUPPORT';
  content: string;
  timestamp: string;
}

const mockTickets: Ticket[] = [
  { id: '#ORP-1029', subject: 'Dúvida sobre Antecipação', category: 'Financeiro', status: 'ANSWERED', lastUpdate: '12 Mar, 10:30', hasNewMessage: true, messages: [] },
  { id: '#ORP-1035', subject: 'Terminal com erro de conexão', category: 'Técnico', status: 'ANALYSIS', lastUpdate: '13 Mar, 08:15', hasNewMessage: false, messages: [] },
  { id: '#ORP-1012', subject: 'Alteração de taxas de crédito', category: 'Taxas', status: 'CLOSED', lastUpdate: '10 Mar, 16:45', hasNewMessage: false, messages: [] },
];

export default function SupportPage() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  
  // Estados do Novo Chamado
  const [ticketData, setTicketData] = useState({
    category: '',
    subject: '',
    description: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [reply, setReply] = useState('');

  // Lógica de Preenchimento Automático via URL
  useEffect(() => {
    const openTicket = searchParams.get('openTicket');
    if (openTicket === 'true') {
      setIsNewTicketOpen(true);
      setTicketData({
        category: searchParams.get('category') || '',
        subject: searchParams.get('subject') || '',
        description: searchParams.get('message') || ''
      });
    }
  }, [searchParams]);

  const statusConfig = {
    OPEN: { label: 'Aberto', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    ANALYSIS: { label: 'Em Análise', color: 'bg-amber-50 text-amber-600 border-amber-100' },
    ANSWERED: { label: 'Respondido', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    CLOSED: { label: 'Fechado', color: 'bg-gray-50 text-gray-500 border-gray-200' },
  };

  const handleNewTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsNewTicketOpen(false);
      toast({ title: "Chamado Criado", description: "Seu protocolo é #ORP-1041. Responderemos em breve.", variant: "success" });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-left">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight">Suporte e Chamados</h2>
            <p className="text-muted-foreground text-sm font-medium">Acompanhe suas solicitações e interaja com nossa equipe.</p>
          </div>
          
          <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
            <DialogTrigger asChild>
              <button className="px-6 py-3.5 bg-[#0A2540] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-[#0A2540]/20 flex items-center gap-2">
                <Plus size={18} /> Novo Chamado
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none bg-white flex flex-col text-left">
              <DialogHeader className="p-8 bg-[#0A2540] text-white space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                  <LifeBuoy size={24} className="text-white" />
                </div>
                <DialogTitle className="text-2xl font-bold tracking-tight">Abrir Solicitação</DialogTitle>
                <DialogDescription className="text-white/60 text-sm">Preencha os dados abaixo para iniciar um novo atendimento.</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleNewTicket} className="p-8 space-y-6">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoria</label>
                    <Select value={ticketData.category} onValueChange={(v) => setTicketData({...ticketData, category: v})} required>
                      <SelectTrigger className="w-full h-12 bg-muted/30 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#0A2540]/10">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border">
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="taxas">Taxas</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Assunto</label>
                    <input 
                      type="text" 
                      required
                      value={ticketData.subject}
                      onChange={(e) => setTicketData({...ticketData, subject: e.target.value})}
                      placeholder="Título curto do problema"
                      className="w-full h-12 bg-muted/30 border-none rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2540]/10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descrição</label>
                    <Textarea 
                      required
                      value={ticketData.description}
                      onChange={(e) => setTicketData({...ticketData, description: e.target.value})}
                      placeholder="Descreva detalhadamente sua dúvida ou problema..."
                      className="w-full bg-muted/30 border-none rounded-xl p-4 text-sm min-h-[120px] focus:ring-[#0A2540]/10"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <button type="submit" disabled={isSaving} className="w-full h-14 bg-[#0A2540] text-white rounded-xl font-bold text-sm hover:opacity-90 shadow-xl shadow-[#0A2540]/20 flex items-center justify-center gap-2">
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : "Enviar Chamado"}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total de Chamados</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-primary">{tickets.length}</span>
              <MessageSquare size={24} className="text-[#0A2540]/10" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Em Aberto</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-amber-600">{tickets.filter(t => t.status !== 'CLOSED').length}</span>
              <Clock size={24} className="text-amber-500/10" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-border shadow-sm space-y-2 text-left">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resolvidos</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-emerald-600">{tickets.filter(t => t.status === 'CLOSED').length}</span>
              <CheckCircle2 size={24} className="text-emerald-500/10" />
            </div>
          </div>
        </div>

        {/* Main List Table */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden text-left">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-border">
                  <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocolo</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assunto</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categoria</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                    <td className="px-6 py-6 text-sm font-bold text-primary">{ticket.id}</td>
                    <td className="px-6 py-6 text-sm font-medium text-slate-700">{ticket.subject}</td>
                    <td className="px-6 py-6">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-bold uppercase tracking-widest border border-slate-200">{ticket.category}</span>
                    </td>
                    <td className="px-6 py-6">
                      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-bold border uppercase tracking-widest", statusConfig[ticket.status].color)}>
                        {statusConfig[ticket.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-center">
                      <button className="p-2 text-slate-300 group-hover:text-primary transition-all"><ArrowUpRight size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
