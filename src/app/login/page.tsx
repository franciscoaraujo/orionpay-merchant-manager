'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Fingerprint,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthService } from '@/services/auth-service';
import { useToast } from '@/hooks/use-toast';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = useState('admin@orionpay.com.br');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const isPasswordStrong = (value: string) => /^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(value);
  const passwordInvalid = touched && !isPasswordStrong(password);

  useEffect(() => {
    const reason = searchParams?.get('reason');
    if (reason === 'unauthenticated') {
      setError('Não autenticado. Sua sessão expirou ou é inválida. Faça login para continuar.');
      return;
    }
    if (typeof window !== 'undefined') {
      try {
        const flag = sessionStorage.getItem('auth:reason');
        if (flag === 'unauthenticated') {
          setError('Não autenticado. Sua sessão expirou ou é inválida. Faça login para continuar.');
          sessionStorage.removeItem('auth:reason');
        }
      } catch {}
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTouched(true);

    try {
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.location.protocol !== 'https:') {
        setError('Conexão insegura. Acesse o portal via HTTPS para realizar login.');
        return;
      }

      if (!isPasswordStrong(password)) {
        setError('Senha fraca. Use no mínimo 8 caracteres, com letras e números.');
        return;
      }

      await AuthService.login({ email, password });
      toast({ title: 'Login realizado', description: 'Bem-vindo de volta!', variant: 'success' });
      const next = searchParams?.get('next');
      router.replace(next && next.startsWith('/') && next !== '/' ? next : '/dashboard');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'friendlyMessage' in err && typeof (err as { friendlyMessage?: unknown }).friendlyMessage === 'string'
          ? (err as { friendlyMessage: string }).friendlyMessage
          : 'Ocorreu um erro ao processar o login.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row font-sans relative">
      {/* Full Screen Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
          <div className="relative flex items-center justify-center">
            {/* Spinning ring */}
            <div className="w-24 h-24 border-4 border-gray-100 border-t-[#0A2540] rounded-full animate-spin" />
            {/* Logo in the center */}
            <div className="absolute">
              <ShieldCheck size={32} className="text-[#0A2540] animate-pulse" />
            </div>
          </div>
          <div className="mt-8 space-y-2 text-center">
            <h3 className="text-xl font-bold text-[#0A2540] tracking-tight">Autenticando</h3>
            <div className="flex items-center justify-center gap-1">
              <span className="w-1.5 h-1.5 bg-[#0A2540] rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-[#0A2540] rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-[#0A2540] rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Left Side: Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24 py-12 relative z-10">
        <div className="w-full max-w-[400px]">
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-[#0A2540] rounded-xl flex items-center justify-center shadow-lg shadow-[#0A2540]/20">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-[#0A2540] tracking-tight">OrionPay</span>
          </div>

          {/* Header */}
          <div className="mb-10 space-y-2">
            <h1 className="text-3xl font-bold text-[#0A2540] tracking-tight">Entrar na sua conta</h1>
            <p className="text-gray-400 text-sm font-medium">Por favor, insira suas credenciais abaixo</p>
          </div>

          {/* Form Section */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-black ml-0.5">E-mail</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0A2540] transition-colors" size={20} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Insira seu e-mail"
                    required
                    autoComplete="username"
                    className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-[#0A2540] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A2540]/50 focus:border-[#0A2540] transition-all placeholder:text-gray-300"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center ml-0.5">
                  <label className="text-sm font-bold text-black">Senha</label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#0A2540] transition-colors" size={20} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="********"
                    required
                    autoComplete="current-password"
                    onBlur={() => setTouched(true)}
                    className={cn(
                      "w-full bg-white border rounded-xl py-4 pl-12 pr-12 text-[#0A2540] text-sm focus:outline-none focus:ring-1 focus:ring-[#0A2540]/50 transition-all placeholder:text-gray-300",
                      passwordInvalid ? "border-red-300 focus:border-red-300" : "border-gray-200 focus:border-[#0A2540]"
                    )}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0A2540] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {passwordInvalid && (
                  <div className="text-xs font-bold text-red-600">
                    Use no mínimo 8 caracteres, com letras e números.
                  </div>
                )}
                <button type="button" className="text-xs font-bold text-[#0A2540] hover:underline absolute right-0 top-0">Esqueci a senha</button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 animate-in fade-in slide-in-from-top-2">
                <Fingerprint size={20} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading || !isPasswordStrong(password)}
              className="w-full bg-[#0A2540] text-white rounded-xl py-4 font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0A2540]/20 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-8 text-center">
            <p className="text-sm font-medium text-gray-500">
              Não tem uma conta? <span onClick={() => router.push('/register')} className="text-[#0A2540] font-bold cursor-pointer hover:underline">Cadastre-se</span>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-20 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
            <p className="text-[11px] text-gray-300 leading-relaxed text-center">
              ® 2024 Orion Enterprise. Ambiente Seguro.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side: Visual Element */}
      <div className="hidden lg:flex flex-1 bg-[#0A2540] relative items-center justify-center overflow-hidden">
        {/* Abstract lines / illustration mockup */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-64 h-64 opacity-5 pointer-events-none absolute">
            <ShieldCheck size={256} className="text-white" />
          </div>
          <div className="max-w-[400px] text-center space-y-4">
            <h2 className="text-3xl font-bold text-white tracking-tight">Potencialize seu negócio</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Gerencie suas transações, acompanhe sua agenda financeira e tenha total controle do seu estabelecimento em uma única plataforma.
            </p>
          </div>
        </div>

        {/* Floating gradient orb for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <LoginPageContent />
    </Suspense>
  );
}
