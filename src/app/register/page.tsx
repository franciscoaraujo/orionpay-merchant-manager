'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Building2, 
  MapPin, 
  CreditCard, 
  ArrowRight, 
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMerchantOnboarding } from '@/hooks/use-merchant-onboarding';

const steps = [
  { id: 1, title: 'Negócio', icon: Building2 },
  { id: 2, title: 'Endereço', icon: MapPin },
  { id: 3, title: 'Bancário', icon: CreditCard },
];

export default function RegisterPage() {
  const router = useRouter();
  
  // Utiliza o Hook Customizado (Enterprise Pattern)
  const {
    form,
    currentStep,
    isLoading,
    nextStep,
    prevStep,
    onSubmit,
    errors
  } = useMerchantOnboarding();

  const { register } = form;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-[640px] space-y-8">
        {/* Header Section */}
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center shadow-lg shadow-[#0A2540]/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0A2540] tracking-tight">OrionPay</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-[#0A2540] tracking-tight">Crie sua conta</h1>
            <p className="text-gray-400 text-sm font-medium italic">Seja bem-vindo à nova era dos pagamentos</p>
          </div>
        </div>

        {/* Stepper UI */}
        <div className="relative flex justify-between items-center px-4">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -translate-y-1/2 z-0" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-[#0A2540] transition-all duration-500 z-0" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isActive = currentStep === step.id;

            return (
              <div key={step.id} className="relative z-10 flex flex-col items-center">
                <div 
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted ? "bg-[#0A2540] border-[#0A2540] text-white" : 
                    isActive ? "bg-white border-[#0A2540] text-[#0A2540]" : 
                    "bg-white border-gray-200 text-gray-400"
                  )}
                >
                  {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-2",
                  isActive ? "text-[#0A2540]" : "text-gray-400"
                )}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-100 rounded-[32px] p-8 md:p-10 shadow-xl shadow-gray-200/50">
          <form onSubmit={onSubmit} className="space-y-8">
            
            {/* Step 1: Dados do Negócio */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#0A2540]">Dados do Negócio</h2>
                  <p className="text-sm text-gray-400">Comece inserindo as informações principais da sua empresa.</p>
                </div>
                
                <div className="grid gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Nome / Razão Social</label>
                    <input 
                      {...register('name')}
                      placeholder="Ex: Orion Enterprise Ltda"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.name ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                    {errors.name && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.name.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">CNPJ / CPF</label>
                    <input 
                      {...register('document')}
                      placeholder="000.000.000-00"
                      maxLength={18}
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.document ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                    {errors.document && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.document.message}</span>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">E-mail</label>
                    <input 
                      {...register('email')}
                      type="email"
                      placeholder="contato@empresa.com.br"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.email ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                    {errors.email && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.email.message}</span>}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Endereço */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#0A2540]">Endereço</h2>
                  <p className="text-sm text-gray-400">Onde sua empresa está localizada?</p>
                </div>
                
                <div className="grid grid-cols-6 gap-4">
                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">CEP</label>
                    <input 
                      {...register('zipCode')}
                      placeholder="00000-000"
                      maxLength={9}
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.zipCode ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                    {errors.zipCode && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.zipCode.message}</span>}
                  </div>

                  <div className="col-span-6 md:col-span-4 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Logradouro</label>
                    <input 
                      {...register('street')}
                      placeholder="Rua, Avenida..."
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.street ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>

                  <div className="col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Número</label>
                    <input 
                      {...register('number')}
                      placeholder="123"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.number ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>

                  <div className="col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Complemento</label>
                    <input 
                      {...register('complement')}
                      placeholder="Sala, Apto..."
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A2540]/50 focus:border-[#0A2540] transition-all"
                    />
                  </div>

                  <div className="col-span-6 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Bairro</label>
                    <input 
                      {...register('neighborhood')}
                      placeholder="Bairro"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.neighborhood ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>

                  <div className="col-span-4 md:col-span-3 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Cidade</label>
                    <input 
                      {...register('city')}
                      placeholder="Cidade"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.city ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">UF</label>
                    <input 
                      {...register('state')}
                      placeholder="SP"
                      maxLength={2}
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all uppercase",
                        errors.state ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Domicílio Bancário */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-[#0A2540]">Domicílio Bancário</h2>
                  <p className="text-sm text-gray-400">Onde você deseja receber seus pagamentos?</p>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-4 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Código do Banco</label>
                    <input 
                      {...register('bankCode')}
                      placeholder="001, 237, 341..."
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.bankCode ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                    {errors.bankCode && <span className="text-[10px] text-red-500 font-bold ml-1">{errors.bankCode.message}</span>}
                  </div>

                  <div className="col-span-4 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Tipo de Conta</label>
                    <select 
                      {...register('accountType')}
                      className="w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A2540]/50 focus:border-[#0A2540] transition-all appearance-none cursor-pointer"
                    >
                      <option value="CHECKING">Conta Corrente</option>
                      <option value="SAVINGS">Conta Poupança</option>
                    </select>
                  </div>

                  <div className="col-span-2 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Agência</label>
                    <input 
                      {...register('branch')}
                      placeholder="0001"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.branch ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>

                  <div className="col-span-2 md:col-span-2 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Conta</label>
                    <input 
                      {...register('account')}
                      placeholder="123456"
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.account ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>

                  <div className="col-span-4 md:col-span-1 space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Dígito</label>
                    <input 
                      {...register('accountDigit')}
                      placeholder="0"
                      maxLength={1}
                      className={cn(
                        "w-full bg-white border rounded-xl py-3 px-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 transition-all",
                        errors.accountDigit ? "border-red-500 focus:ring-red-500/50" : "border-gray-200 focus:ring-[#0A2540]/50 focus:border-[#0A2540]"
                      )}
                    />
                  </div>
                </div>

                <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex gap-3">
                  <Info size={20} className="text-[#0A2540] shrink-0" />
                  <p className="text-[11px] text-[#0A2540] leading-relaxed font-medium">
                    Certifique-se de que a conta bancária informada possua o mesmo CNPJ/CPF do cadastro para evitar atrasos na liquidação.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-4">
              {currentStep > 1 && (
                <button 
                  type="button"
                  onClick={prevStep}
                  className="flex-1 px-6 py-4 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-sm font-bold text-gray-500 flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={18} />
                  Anterior
                </button>
              )}
              
              {currentStep < 3 ? (
                <button 
                  type="button"
                  onClick={nextStep}
                  className="flex-1 bg-[#0A2540] text-white rounded-2xl py-4 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0A2540]/20"
                >
                  Continuar
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button 
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-[#0A2540] text-white rounded-2xl py-4 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0A2540]/20 disabled:opacity-50"
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      Finalizar Cadastro
                      <ChevronRight size={18} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400">
              Já possui uma conta? <span onClick={() => router.push('/')} className="text-[#0A2540] font-bold cursor-pointer hover:underline">Fazer Login</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
