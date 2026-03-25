'use client';

import React, { useState } from 'react';
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
  ArrowRight
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
  {
    id: '#ORP-1029',
    subject: 'Dúvida sobre Antecipação',
    category: 'Financeiro',
    status: 'ANSWERED',
    lastUpdate: '12 Mar, 10:30',
    hasNewMessage: true,
    messages: [
      { id: '1', sender: 'USER', content: 'Gostaria de saber por que minha antecipação ainda não caiu.', timestamp: '12 Mar, 09:00' },
      { id: '2', sender: 'SUPPORT', content: 'Olá! Identificamos uma instabilidade temporária no banco liquidante. O prazo foi estendido para as 14h.', timestamp: '12 Mar, 10:30' },
    ]
  },
  {
    id: '#ORP-1035',
    subject: 'Terminal com erro de conexão',
    category: 'Técnico',
    status: 'ANALYSIS',
    lastUpdate: '13 Mar, 08:15',
    hasNewMessage: false,
    messages: [
      { id: '1', sender: 'USER', content: 'Minha máquina modelo S920 está dando erro de GPRS.', timestamp: '13 Mar, 08:15' },
    ]
  },
  {
    id: '#ORP-1012',
    subject: 'Alteração de taxas de crédito',
    category: 'Taxas',
    status: 'CLOSED',
    lastUpdate: '10 Mar, 16:45',
    hasNewMessage: false,
    messages: [
      { id: '1', sender: 'USER', content: 'Solicito revisão da minha taxa de crédito à vista.', timestamp: '09 Mar, 14:00' },
      { id: '2', sender: 'SUPPORT', content: 'Sua solicitação foi aprovada. As novas taxas já estão em vigor.', timestamp: '10 Mar, 16:45' },
    ]
  },
  {
    id: '#ORP-1040',
    subject: 'Erro no extrato de vendas',
    category: 'Financeiro',
    status: 'OPEN',
    lastUpdate: 'Hoje, 09:20',
    hasNewMessage: false,
    messages: [
      { id: '1', sender: 'USER', content: 'As vendas de ontem não aparecem no extrato.', timestamp: 'Hoje, 09:20' },
    ]
  },
];

export default function SupportPage() {
  const { toast } = useToast();
  const [tickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reply, setReply] = useState('');

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
      toast({
        title: "Chamado Criado",
        description: "Seu protocolo é #ORP-1041. Responderemos em breve.",
        variant: "success",
      });
    }, 1500);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reply.trim()) return;
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setReply('');
      toast({
        title: "Mensagem Enviada",
        description: "Sua resposta foi anexada ao chamado.",
        variant: "success",
      });
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#0A2540] tracking-tight">Suporte e Chamados</h2>
            <p className="text-muted-foreground text-sm">Acompanhe suas solicitações e interaja com nossa equipe técnica.</p>
          </div>
          
          <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
            <DialogTrigger asChild>
              <button className="px-6 py-3 bg-[#21ba45] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-[#21ba45]/20 flex items-center gap-2">
                <Plus size={18} />
                Novo Chamado
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none bg-white">
              <DialogHeader className="p-8 bg-[#0A2540] text-white space-y-2">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                  <LifeBuoy size={24} className="text-[#21ba45]" />
                </div>
                <DialogTitle className="text-2xl font-bold text-white tracking-tight">Abrir Solicitação</DialogTitle>
                <DialogDescription className="text-primary-foreground/70 text-sm">
                  Preencha os dados abaixo para iniciar um novo atendimento.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleNewTicket} className="p-8 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoria</label>
                    <Select required>
                      <SelectTrigger className="w-full h-12 bg-muted/30 border-none rounded-xl text-sm">
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

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Assunto</label>
                    <input 
                      type="text" 
                      placeholder="Título curto do problema"
                      required
                      className="w-full h-12 bg-muted/30 border-none rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#21ba45]/20 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descrição</label>
                    <Textarea 
                      placeholder="Descreva detalhadamente sua dúvida ou problema..."
                      required
                      className="w-full bg-muted/30 border-none rounded-xl p-4 text-sm min-h-[120px] resize-none focus:ring-[#21ba45]/20"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full h-14 bg-[#21ba45] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#21ba45]/20 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      "Enviar Chamado"
                    )}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total de Chamados</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-[#0A2540]">{tickets.length}</span>
              <MessageSquare size={24} className="text-blue-500/20" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Em Aberto</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-amber-600">{tickets.filter(t => t.status !== 'CLOSED').length}</span>
              <Clock size={24} className="text-amber-500/20" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Resolvidos</span>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold text-emerald-600">{tickets.filter(t => t.status === 'CLOSED').length}</span>
              <CheckCircle2 size={24} className="text-emerald-500/20" />
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por protocolo ou assunto..."
                className="w-full bg-white border border-gray-100 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/5 transition-all"
              />
            </div>
            <button className="px-4 py-3 bg-white border border-gray-100 rounded-xl flex items-center gap-2 text-sm font-bold text-muted-foreground hover:bg-gray-50 transition-colors">
              <Filter size={18} />
              Filtrar por Status
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Protocolo</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Assunto</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Categoria</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Última Atualização</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tickets.map((ticket) => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => setSelectedTicket(ticket)}
                      className={cn(
                        "hover:bg-gray-50/50 transition-colors cursor-pointer relative group",
                        ticket.hasNewMessage && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-[#21ba45]"
                      )}
                    >
                      <td className="px-6 py-6 text-sm font-bold text-[#0A2540]">{ticket.id}</td>
                      <td className="px-6 py-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-medium text-[#0A2540]">{ticket.subject}</span>
                          {ticket.hasNewMessage && (
                            <span className="text-[10px] font-bold text-[#21ba45] uppercase tracking-widest">Nova resposta</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider",
                          statusConfig[ticket.status].color
                        )}>
                          {statusConfig[ticket.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-xs text-muted-foreground">{ticket.lastUpdate}</td>
                      <td className="px-6 py-6 text-center">
                        <button className="p-2 text-muted-foreground group-hover:text-primary group-hover:bg-primary/5 rounded-lg transition-all">
                          <ArrowRight size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Details Drawer */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="sm:max-w-xl p-0 flex flex-col h-full bg-white border-none shadow-2xl">
          {selectedTicket && (
            <>
              <SheetHeader className="p-8 bg-[#0A2540] text-white">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-white border border-white/10">
                    {selectedTicket.id}
                  </span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-widest",
                    statusConfig[selectedTicket.status].color,
                    "bg-white/5 border-white/10 text-white"
                  )}>
                    {statusConfig[selectedTicket.status].label}
                  </span>
                </div>
                <SheetTitle className="text-2xl font-bold text-white tracking-tight">{selectedTicket.subject}</SheetTitle>
                <SheetDescription className="text-primary-foreground/60 text-sm mt-1">
                  Categoria: {selectedTicket.category} • Criado em {selectedTicket.lastUpdate}
                </SheetDescription>
              </SheetHeader>

              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-gray-50/30">
                {selectedTicket.messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.sender === 'USER' ? "ml-auto items-end" : "items-start"
                    )}
                  >
                    <div className={cn(
                      "p-4 rounded-2xl text-sm shadow-sm",
                      msg.sender === 'USER' 
                        ? "bg-[#0A2540] text-white rounded-tr-none" 
                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground mt-2 px-1">
                      {msg.sender === 'USER' ? 'Você' : 'Suporte OrionPay'} • {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>

              {/* Reply Area */}
              <div className="p-6 bg-white border-t border-gray-100">
                <form onSubmit={handleSendReply} className="space-y-4">
                  <div className="relative group">
                    <Textarea 
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Escreva sua resposta aqui..."
                      className="min-h-[100px] bg-gray-50 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-[#0A2540]/5 transition-all resize-none"
                    />
                    <div className="absolute bottom-3 right-3 flex items-center gap-2">
                      <button type="button" className="p-2 text-muted-foreground hover:text-primary hover:bg-gray-100 rounded-lg transition-all">
                        <Paperclip size={18} />
                      </button>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    disabled={isSaving || !reply.trim()}
                    className="w-full h-12 bg-[#0A2540] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Responder Chamado
                        <Send size={16} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
}
