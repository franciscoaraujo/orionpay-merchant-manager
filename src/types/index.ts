export type TransactionStatus = 'AUTHORIZED' | 'CAPTURED' | 'DENIED' | 'REFUNDED' | 'FAILED';

export interface Transaction {
  id: string;
  external_id: string;
  amount: number;
  currency: string;
  brand: 'VISA' | 'MASTERCARD' | 'ELO' | 'AMEX';
  status: TransactionStatus;
  nsu: string;
  authorization_code?: string;
  created_at: string;
  updated_at: string;
  merchant_id: string;
  terminal_id: string;
  card_last_four: string;
  card_holder_name: string;
}

export interface TransactionEvent {
  id: string;
  transaction_id: string;
  event_type: string;
  status_from: string;
  status_to: string;
  payload: unknown;
  created_at: string;
}

export type SettlementStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'SCHEDULED';
export type OwnershipStatus = 'AVAILABLE' | 'LINKED_TO_GUARANTEE' | 'ANTICIPATED';

export interface ContractEffect {
  creditor_institution: string;
  effect_type: 'LOAN_GUARANTEE' | 'CREDIT_ASSIGNMENT' | 'DOMICILE_LOCK';
  registration_date: string;
  registrar: 'CERC' | 'TAG';
}

export interface Settlement {
  id: string;
  transaction_id: string;
  amount_gross: number;
  amount_net: number;
  fee_mdr: number;
  fee_anticipation: number;
  status: SettlementStatus;
  settlement_date: string;
  bank_account_last_four: string;
  bank_name: string;
  ownership_status: OwnershipStatus;
  contract_effect?: ContractEffect;
}

export interface Terminal {
  id: string;
  serial_number: string;
  model: string;
  type: 'POS' | 'SMART_POS' | 'E-COMMERCE' | 'MOBILE';
  status: 'ACTIVE' | 'BLOCKED' | 'OFFLINE';
  last_activity: string;
  version: string;
  merchant_id: string;
}

export interface AnticipationSimulation {
  total_gross: number;
  total_net: number;
  total_fees: number;
  anticipation_fee_rate: number;
  items_count: number;
}

export interface KPI {
  label: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  prefix?: string;
  suffix?: string;
}
