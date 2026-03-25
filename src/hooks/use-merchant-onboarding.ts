'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from './use-toast';
import { MerchantService } from '../services/merchant-service';

/**
 * Esquema de Validação do Onboarding (Zod).
 * Realiza a limpeza de máscaras de forma automática através do transform.
 */
export const onboardingSchema = z.object({
  // Dados do Negócio
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  document: z.string()
    .transform(v => v.replace(/\D/g, ''))
    .refine(v => v.length === 11 || v.length === 14, 'Documento inválido (deve ter 11 ou 14 dígitos)'),
  email: z.string().email('E-mail inválido'),
  // Endereço
  zipCode: z.string()
    .transform(v => v.replace(/\D/g, ''))
    .refine(v => v.length === 8, 'CEP deve ter 8 dígitos'),
  street: z.string().min(3, 'Logradouro inválido'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, 'Bairro inválido'),
  city: z.string().min(2, 'Cidade inválida'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  // Domicílio Bancário
  bankCode: z.string().transform(v => v.replace(/\D/g, '')).refine(v => v.length >= 3, 'Código do banco inválido'),
  branch: z.string().transform(v => v.replace(/\D/g, '')).refine(v => v.length >= 3, 'Agência inválida'),
  account: z.string().transform(v => v.replace(/\D/g, '')).refine(v => v.length >= 3, 'Conta inválida'),
  accountDigit: z.string().transform(v => v.replace(/\D/g, '')).refine(v => v.length === 1, 'Dígito inválido'),
  accountType: z.enum(['CHECKING', 'SAVINGS']),
});

export type OnboardingData = z.infer<typeof onboardingSchema>;

/**
 * useMerchantOnboarding - Hook Customizado para gerenciar o estado do Cadastro.
 */
export function useMerchantOnboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<OnboardingData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      accountType: 'CHECKING',
    },
  });

  /**
   * Avança para o próximo passo do formulário, validando apenas os campos da etapa atual.
   */
  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingData)[] = [];
    
    if (currentStep === 1) {
      fieldsToValidate = ['name', 'document', 'email'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['zipCode', 'street', 'number', 'neighborhood', 'city', 'state'];
    }

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    }
  };

  /**
   * Retorna para a etapa anterior.
   */
  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  /**
   * Envia os dados finais para o Merchant Service.
   */
  const onSubmit = async (data: OnboardingData) => {
    setIsLoading(true);
    try {
      // Chama o Service isolado (Enterprise Pattern)
      await MerchantService.registerOnboarding(data);
      
      toast({
        title: "Cadastro Realizado!",
        description: "Seu estabelecimento foi registrado com sucesso. Redirecionando...",
        variant: "success",
      });

      // Aguarda 2 segundos para o usuário ver o feedback visual antes de redirecionar
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error: unknown) {
      const errorMessage =
        typeof error === 'object' && error !== null && 'friendlyMessage' in error && typeof (error as { friendlyMessage?: unknown }).friendlyMessage === 'string'
          ? (error as { friendlyMessage: string }).friendlyMessage
          : "Ocorreu um erro ao processar sua solicitação.";
      
      toast({
        title: "Erro no Cadastro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    currentStep,
    isLoading,
    nextStep,
    prevStep,
    onSubmit: form.handleSubmit(onSubmit),
    errors: form.formState.errors,
  };
}
