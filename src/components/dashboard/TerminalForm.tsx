'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { Terminal } from '@/types';
import { cn } from '@/lib/utils';

interface TerminalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Terminal>) => void;
  isLoading?: boolean;
}

export function TerminalForm({ isOpen, onClose, onSubmit, isLoading }: TerminalFormProps) {
  const [formData, setFormData] = useState<Partial<Terminal>>({
    model: '',
    serial_number: '',
    type: 'POS',
    status: 'ACTIVE',
    version: '1.0.0'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
          <h2 className="text-lg font-bold text-primary">Cadastrar Novo Terminal</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Modelo do Terminal</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Pax A920, Gertec..."
              className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Número de Série (SN)</label>
            <input 
              required
              type="text" 
              placeholder="Ex: SN-12345678"
              className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              value={formData.serial_number}
              onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tipo</label>
              <select 
                className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Terminal['type'] })}
              >
                <option value="POS">POS Físico</option>
                <option value="SMART_POS">Smart POS</option>
                <option value="E-COMMERCE">E-Commerce</option>
                <option value="MOBILE">Mobile</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Versão Inicial</label>
              <input 
                type="text" 
                placeholder="1.0.0"
                className="w-full px-4 py-2 bg-muted/50 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                value={formData.version}
                onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex gap-3 mt-2">
            <AlertCircle size={18} className="text-blue-600 shrink-0" />
            <p className="text-[10px] text-blue-800 leading-tight">
              Ao cadastrar, o terminal entrará em estado Ativo por padrão e estará pronto para receber a primeira transação.
            </p>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-lg hover:bg-muted transition-colors text-sm font-bold"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-bold flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Save size={18} /> Salvar</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
