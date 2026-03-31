'use client';

import React, { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { 
  User, 
  Building2, 
  CreditCard, 
  History,
  Monitor,
  MapPin,
  Clock,
  ArrowRight,
  Search,
  Filter,
  ShieldCheck, 
  Bell, 
  Key, 
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Info,
  Save,
  ChevronRight,
  Globe,
  Download,
  MessageSquare,
  Send,
  LifeBuoy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SettingsTab = 'profile' | 'merchant' | 'acceptance' | 'security' | 'activity' | 'notifications';

const BrandIcon = ({ brand }: { brand: string }) => {
  const isVisa = brand.toLowerCase().includes('visa');
  const isMaster = brand.toLowerCase().includes('master');
  const isElo = brand.toLowerCase().includes('elo');
  const isAmex = brand.toLowerCase().includes('amex');

  return (
    <div className="flex items-center gap-2">
      <div className="flex -space-x-1.5">
        {isVisa && <div className="w-6 h-4 bg-[#1A1F71] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">VISA</div>}
        {isMaster && <div className="w-6 h-4 bg-[#EB001B] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">MC</div>}
        {isElo && <div className="w-6 h-4 bg-[#00AEEF] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">ELO</div>}
        {isAmex && <div className="w-6 h-4 bg-[#007BC1] rounded-sm flex items-center justify-center text-[6px] text-white font-bold italic">AMEX</div>}
      </div>
      <span className="text-sm font-bold text-primary">{brand}</span>
    </div>
  );
};

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportForm, setSupportForm] = useState({
    category: '',
    subject: '',
    description: ''
  });

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setIsSupportOpen(false);
      setSupportForm({ category: '', subject: '', description: '' });
      
      toast({
        title: "Ticket Criado com Sucesso",
        description: "Nossa equipe de suporte entrará em contato em até 24 horas úteis.",
        variant: "success",
      });
    }, 1500);
  };

  // State for Acceptance Management
  const [acceptanceData, setAcceptanceData] = useState([
    { 
      id: 'credit_spot',
      title: 'Crédito à Vista', 
      items: [
        { id: 'cs_visa_master', brand: 'Visa / Mastercard', isActive: true },
        { id: 'cs_elo_amex', brand: 'Elo / Amex', isActive: true },
        { id: 'cs_others', brand: 'Outros (Diners)', isActive: false },
      ]
    },
    { 
      id: 'debit',
      title: 'Débito', 
      items: [
        { id: 'db_visa_master', brand: 'Visa / Mastercard', isActive: true },
        { id: 'db_elo', brand: 'Elo', isActive: true },
        { id: 'db_others', brand: 'Outros', isActive: true },
      ]
    },
    { 
      id: 'credit_installment',
      title: 'Crédito Parcelado', 
      items: [
        { id: 'ci_visa_master', brand: 'Visa / Mastercard', isActive: true },
        { id: 'ci_elo_amex', brand: 'Elo / Amex', isActive: true },
      ]
    },
  ]);

  const [hasChanges, setHasChanges] = useState(false);

  const toggleAcceptance = (categoryId: string, itemId: string) => {
    setAcceptanceData(prev => prev.map(category => {
      if (category.id === categoryId) {
        return {
          ...category,
          items: category.items.map(item => {
            if (item.id === itemId) {
              setHasChanges(true);
              return { ...item, isActive: !item.isActive };
            }
            return item;
          })
        };
      }
      return category;
    }));
  };

  const tabs = [
    { id: 'profile', label: 'Meu Perfil', icon: User },
    { id: 'merchant', label: 'Dados do Estabelecimento', icon: Building2 },
    { id: 'acceptance', label: 'Gestão de Aceitação', icon: CreditCard },
    { id: 'security', label: 'Segurança e Chaves', icon: ShieldCheck },
    { id: 'activity', label: 'Atividade', icon: History },
    { id: 'notifications', label: 'Notificações', icon: Bell },
  ] as const;

  const [accessLogs] = useState([
    { id: 1, date: '2026-03-12 14:20:05', status: 'Sucesso', ip: '189.120.45.2', device: 'Chrome / Windows', location: 'São Paulo, SP' },
    { id: 2, date: '2026-03-12 09:15:30', status: 'Sucesso', ip: '189.120.45.2', device: 'Chrome / Windows', location: 'São Paulo, SP' },
    { id: 3, date: '2026-03-11 22:40:12', status: 'Falha', ip: '45.230.12.188', device: 'Firefox / Linux', location: 'Kiev, UA' },
    { id: 4, date: '2026-03-11 18:05:45', status: 'Sucesso', ip: '189.120.45.2', device: 'Safari / iPhone', location: 'São Paulo, SP' },
  ]);

  const [auditLogs] = useState([
    { 
      id: 1, 
      user: 'admin@orionpay.com.br', 
      action: 'Alteração de Taxa', 
      description: 'Bandeira ELO desativada para Crédito à Vista', 
      date: '2026-03-12 14:22:10',
      oldValue: 'Ativado',
      newValue: 'Desativado'
    },
    { 
      id: 2, 
      user: 'admin@orionpay.com.br', 
      action: 'Segurança', 
      description: 'Autenticação em Duas Etapas (2FA) ativada', 
      date: '2026-03-11 10:30:00',
      oldValue: 'Desativado',
      newValue: 'Ativado'
    },
    { 
      id: 3, 
      user: 'comercial@orionpay.com.br', 
      action: 'Alteração de Taxa', 
      description: 'Taxa Visa Crédito à Vista alterada', 
      date: '2026-03-10 16:45:20',
      oldValue: '2.55%',
      newValue: '2.45%'
    },
  ]);

  const handleSave = () => {
    setIsSaving(true);
    // Simulating PATCH /v1/merchants/{id}/configs
    setTimeout(() => {
      setIsSaving(false);
      setHasChanges(false);
      
      toast({
        title: "Configurações Atualizadas",
        description: "As alterações foram salvas com sucesso no log de auditoria.",
        variant: "success",
      });
    }, 1000);
  };

  const handleExport = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Relatórios Exportados",
        description: "O arquivo .pdf está pronto e o download começará em instantes.",
        variant: "info",
      });
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-primary tracking-tight">Configurações</h2>
          <p className="text-muted-foreground text-sm">Gerencie seu perfil, taxas contratuais e preferências de segurança.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Tabs Navigation */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                    activeTab === tab.id 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10" 
                      : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Tab Content */}
          <div className="flex-1 space-y-6">
            <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                      OE
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-primary">Orion Enterprise Admin</h3>
                      <p className="text-sm text-muted-foreground">admin@orionpay.com.br</p>
                      <button className="mt-2 text-xs font-bold text-accent hover:underline">Alterar Foto de Perfil</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Nome Completo</label>
                      <input 
                        type="text" 
                        defaultValue="Orion Enterprise Admin"
                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">E-mail</label>
                      <input 
                        type="email" 
                        defaultValue="admin@orionpay.com.br"
                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Telefone</label>
                      <input 
                        type="text" 
                        defaultValue="(11) 98765-4321"
                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Cargo</label>
                      <input 
                        type="text" 
                        defaultValue="Diretor Financeiro"
                        className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Merchant Tab */}
              {activeTab === 'merchant' && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-primary">Dados do Estabelecimento</h3>
                    <p className="text-sm text-muted-foreground">Informações cadastrais e domicílio bancário.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Razão Social</label>
                      <input 
                        readOnly
                        defaultValue="ORION PAY TECNOLOGIA LTDA"
                        className="w-full px-4 py-2 bg-muted/30 border border-input rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">CNPJ</label>
                      <input 
                        readOnly
                        defaultValue="12.345.678/0001-90"
                        className="w-full px-4 py-2 bg-muted/30 border border-input rounded-lg text-sm text-muted-foreground cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary">
                      <Building2 size={18} />
                      Domicílio Bancário (Liquidante)
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Banco</span>
                        <span className="text-sm font-bold text-primary block">341 - Itaú Unibanco</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Agência</span>
                        <span className="text-sm font-bold text-primary block">0001</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Conta Corrente</span>
                        <span className="text-sm font-bold text-primary block">*****1234-5</span>
                      </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                      <button className="text-xs font-bold text-accent hover:underline flex items-center gap-1">
                        Solicitar Alteração <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Acceptance Management Tab */}
              {activeTab === 'acceptance' && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-primary">Gestão de Aceitação</h3>
                    <p className="text-sm text-muted-foreground">
                      Configure quais bandeiras e modalidades sua empresa aceita. Alterações aqui impactam diretamente suas máquinas de cartão e checkout online.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {acceptanceData.map((category) => (
                      <div key={category.id} className="p-6 bg-muted/20 rounded-2xl border border-border space-y-4 flex flex-col">
                        <div className="flex justify-between items-center border-b border-border pb-3">
                          <span className="text-sm font-bold text-primary uppercase tracking-wider">{category.title}</span>
                          <Info size={16} className="text-muted-foreground/40 cursor-help" />
                        </div>
                        <div className="space-y-3 flex-1">
                          {category.items.map((item) => (
                            <div 
                              key={item.id} 
                              className={cn(
                                "flex justify-between items-center p-3 rounded-xl border transition-all bg-card",
                                item.isActive ? "border-border" : "border-dashed border-border/50 opacity-50 grayscale"
                              )}
                            >
                              <BrandIcon brand={item.brand} />
                              <button
                                onClick={() => toggleAcceptance(category.id, item.id)}
                                className={cn(
                                  "w-10 h-5 rounded-full relative transition-colors",
                                  item.isActive ? "bg-accent" : "bg-muted-foreground/30"
                                )}
                              >
                                <div className={cn(
                                  "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                                  item.isActive ? "right-1" : "left-1"
                                )} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex gap-3">
                    <AlertCircle size={20} className="text-primary shrink-0" />
                    <p className="text-xs text-primary leading-relaxed font-medium">
                      Note: A desativação de uma bandeira impedirá transações futuras nesta modalidade. Transações já autorizadas não serão afetadas.
                    </p>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-primary">Segurança e Chaves</h3>
                    <p className="text-sm text-muted-foreground">Gerencie chaves de API e preferências de autenticação.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-card border border-border rounded-xl space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Key size={18} className="text-muted-foreground" />
                          <span className="text-sm font-bold text-primary uppercase tracking-wider">API Key (Produção)</span>
                        </div>
                        <button 
                          onClick={() => setHasChanges(true)}
                          className="text-xs font-bold text-red-500 hover:underline"
                        >
                          Revogar Chave
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <input 
                          type="password" 
                          readOnly
                          defaultValue="op_live_550e8400e29b41d4a716446655440000"
                          className="flex-1 px-4 py-2 bg-muted/50 border border-input rounded-lg text-sm font-mono"
                        />
                        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-bold">Copiar</button>
                      </div>
                    </div>

                    <div className="p-4 bg-card border border-border rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                          <Smartphone size={20} />
                        </div>
                        <div>
                          <span className="text-sm font-bold text-primary block">Autenticação em Duas Etapas (2FA)</span>
                          <span className="text-xs text-muted-foreground">Proteja sua conta com um nível extra de segurança.</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-widest">
                          Ativado
                          <CheckCircle2 size={16} />
                        </div>
                        <button 
                          onClick={() => setHasChanges(true)}
                          className="text-xs font-bold text-accent hover:underline"
                        >
                          Configurar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Activity & Audit Tab */}
              {activeTab === 'activity' && (
                <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-primary">Atividade e Auditoria</h3>
                      <p className="text-sm text-muted-foreground">Monitore acessos e alterações críticas no seu portal.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input 
                          type="text" 
                          placeholder="Buscar por IP ou Usuário..."
                          className="pl-10 pr-4 py-2 bg-muted/50 border border-input rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all w-64"
                        />
                      </div>
                      <button className="p-2 border border-input rounded-xl hover:bg-muted transition-colors text-muted-foreground">
                        <Filter size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Access Logs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                      <ShieldCheck size={18} className="text-muted-foreground" />
                      Logs de Acesso Recentes
                    </div>
                    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted/30 border-b border-border">
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data / Hora</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Endereço IP</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Dispositivo</th>
                            <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Localização</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {accessLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-muted/10 transition-colors">
                              <td className="px-6 py-4 text-xs font-medium text-primary whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  <Clock size={12} className="text-muted-foreground" />
                                  {log.date}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className={cn(
                                  "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                  log.status === 'Sucesso' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                )}>
                                  {log.status === 'Sucesso' ? 'Sucesso' : 'Tentativa'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-xs font-mono text-muted-foreground">{log.ip}</td>
                              <td className="px-6 py-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Monitor size={12} />
                                  {log.device}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xs text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <MapPin size={12} />
                                  {log.location}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Audit Trail */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-primary uppercase tracking-wider">
                      <History size={18} className="text-muted-foreground" />
                      Histórico de Alterações (Audit Trail)
                    </div>
                    <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
                      {auditLogs.map((log) => (
                        <div key={log.id} className="relative pl-10 pb-8 last:pb-0">
                          <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-card border-2 border-primary flex items-center justify-center z-10">
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          </div>
                          <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-3">
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-primary">{log.user}</span>
                                  <span className="px-2 py-0.5 bg-muted rounded-md text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{log.action}</span>
                                </div>
                                <p className="text-sm font-medium text-primary">{log.description}</p>
                              </div>
                              <span className="text-[10px] font-bold text-muted-foreground">{log.date}</span>
                            </div>
                            
                            <div className="flex items-center gap-4 py-3 px-4 bg-muted/20 rounded-xl border border-border/50">
                              <div className="space-y-1 flex-1">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">De</span>
                                <span className="text-xs font-medium text-muted-foreground line-through decoration-red-500/50">{log.oldValue}</span>
                              </div>
                              <ArrowRight size={16} className="text-muted-foreground/30" />
                              <div className="space-y-1 flex-1">
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">Para</span>
                                <span className="text-xs font-bold text-emerald-600">{log.newValue}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}

              {/* Footer Actions */}
              <div className="p-6 border-t border-border bg-muted/10 flex justify-end gap-3">
                {activeTab === 'activity' ? (
                  <button 
                    onClick={handleExport}
                    disabled={isSaving}
                    className="px-8 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-bold flex items-center gap-2 min-w-[140px] justify-center"
                  >
                    {isSaving ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <><Download size={18} /> Exportar Relatórios</>
                    )}
                  </button>
                ) : (
                  <>
                    <button 
                      onClick={() => setHasChanges(false)}
                      className="px-6 py-2 border border-input rounded-xl hover:bg-muted transition-colors text-sm font-bold text-muted-foreground"
                    >
                      Descartar Alterações
                    </button>
                    <button 
                      onClick={handleSave}
                      disabled={isSaving || !hasChanges}
                      className={cn(
                        "px-8 py-2 rounded-xl transition-all text-sm font-bold flex items-center gap-2 min-w-[140px] justify-center",
                        isSaving || !hasChanges 
                          ? "bg-muted text-muted-foreground cursor-not-allowed" 
                          : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/10"
                      )}
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><Save size={18} /> Salvar Alterações</>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-primary p-6 rounded-2xl flex items-center gap-6 relative overflow-hidden group">
              <div className="absolute right-[-2%] top-[-20%] opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Globe size={160} className="text-white" />
              </div>
              <div className="relative z-10 flex-1 space-y-1">
                <h4 className="text-white font-bold text-lg">Precisa de Ajuda?</h4>
                <p className="text-primary-foreground/70 text-sm">
                  Nossa central de suporte está disponível 24/7 para auxiliar com questões cadastrais ou contratuais.
                </p>
              </div>
              <div className="relative z-10">
                <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
                  <DialogTrigger asChild>
                    <button className="px-6 py-3 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all shadow-xl shadow-accent/20 flex items-center gap-2">
                      <LifeBuoy size={18} />
                      Falar com Suporte
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[500px] p-0 overflow-hidden border-none bg-white">
                    <DialogHeader className="p-8 bg-[#0A2540] text-white space-y-2 relative overflow-hidden">
                      <div className="absolute right-[-10%] top-[-20%] opacity-5">
                        <MessageSquare size={160} className="text-white" />
                      </div>
                      <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-2">
                        <MessageSquare size={24} className="text-accent" />
                      </div>
                      <DialogTitle className="text-2xl font-bold text-white tracking-tight">Novo Chamado</DialogTitle>
                      <DialogDescription className="text-primary-foreground/70 text-sm">
                        Descreva sua solicitação abaixo e nossa equipe retornará o mais breve possível.
                      </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSupportSubmit} className="p-8 space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Categoria</label>
                          <Select 
                            value={supportForm.category || undefined} 
                            onValueChange={(val) => setSupportForm({ ...supportForm, category: val })}
                            required
                          >
                            <SelectTrigger className="w-full h-12 bg-muted/30 border-none rounded-xl text-sm focus:ring-accent/20">
                              <SelectValue placeholder="Selecione o assunto" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border shadow-2xl">
                              <SelectItem value="fees">Taxas e Tarifas</SelectItem>
                              <SelectItem value="terminals">Terminais e Máquinas</SelectItem>
                              <SelectItem value="settlement">Pagamentos e Agenda</SelectItem>
                              <SelectItem value="security">Segurança e Acesso</SelectItem>
                              <SelectItem value="others">Outros Assuntos</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Assunto</label>
                          <input 
                            type="text" 
                            value={supportForm.subject}
                            onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                            placeholder="Resuma o motivo do contato"
                            required
                            className="w-full h-12 bg-muted/30 border-none rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/50"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Descrição</label>
                          <Textarea 
                            value={supportForm.description}
                            onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })}
                            placeholder="Conte-nos mais detalhes..."
                            required
                            className="w-full bg-muted/30 border-none rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 transition-all placeholder:text-muted-foreground/50 min-h-[120px] resize-none"
                          />
                        </div>
                      </div>

                      <DialogFooter className="pt-2">
                        <button 
                          type="submit"
                          disabled={isSaving}
                          className="w-full h-14 bg-accent text-accent-foreground rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/20 disabled:opacity-50 group"
                        >
                          {isSaving ? (
                            <div className="w-5 h-5 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              Enviar Solicitação
                              <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
