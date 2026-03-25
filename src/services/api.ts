import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const correlationId = crypto.randomUUID();
  config.headers['X-Correlation-ID'] = correlationId;
  return config;
});

export default api;

export const mockTransactions = [
  {
    id: 'tx_123456',
    external_id: 'ext_789',
    amount: 150.50,
    currency: 'BRL',
    brand: 'VISA',
    status: 'CAPTURED',
    nsu: '123456789',
    authorization_code: 'AUT001',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    merchant_id: 'm_001',
    terminal_id: 't_001',
    card_last_four: '1234',
    card_holder_name: 'JOAO SILVA'
  },
  {
    id: 'tx_123457',
    external_id: 'ext_790',
    amount: 89.90,
    currency: 'BRL',
    brand: 'MASTERCARD',
    status: 'AUTHORIZED',
    nsu: '987654321',
    authorization_code: 'AUT002',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
    merchant_id: 'm_001',
    terminal_id: 't_001',
    card_last_four: '5678',
    card_holder_name: 'MARIA SOUZA'
  },
  {
    id: 'tx_123458',
    external_id: 'ext_791',
    amount: 1200.00,
    currency: 'BRL',
    brand: 'ELO',
    status: 'DENIED',
    nsu: '456123789',
    authorization_code: '',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    merchant_id: 'm_001',
    terminal_id: 't_002',
    card_last_four: '9012',
    card_holder_name: 'PEDRO ALVES'
  }
];

export const mockEvents = [
  {
    id: 'evt_1',
    transaction_id: 'tx_123456',
    event_type: 'AUTHORIZATION_REQUEST',
    status_from: 'PENDING',
    status_to: 'AUTHORIZED',
    payload: { response_code: '00' },
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'evt_2',
    transaction_id: 'tx_123456',
    event_type: 'CAPTURE_REQUEST',
    status_from: 'AUTHORIZED',
    status_to: 'CAPTURED',
    payload: { capture_id: 'cap_001' },
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
  }
];

export const mockSettlements = [
  {
    id: 'set_001',
    transaction_id: 'tx_123456',
    amount_gross: 150.50,
    amount_net: 145.20,
    fee_mdr: 5.30,
    fee_anticipation: 0,
    status: 'SCHEDULED',
    settlement_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days from now
    bank_account_last_four: '4567',
    bank_name: 'ITAÚ UNIBANCO',
    ownership_status: 'AVAILABLE'
  },
  {
    id: 'set_002',
    transaction_id: 'tx_123457',
    amount_gross: 89.90,
    amount_net: 87.10,
    fee_mdr: 2.80,
    fee_anticipation: 0,
    status: 'PAID',
    settlement_date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday
    bank_account_last_four: '4567',
    bank_name: 'ITAÚ UNIBANCO',
    ownership_status: 'AVAILABLE'
  },
  {
    id: 'set_003',
    transaction_id: 'tx_123458',
    amount_gross: 1200.00,
    amount_net: 1160.00,
    fee_mdr: 40.00,
    fee_anticipation: 0,
    status: 'PENDING',
    settlement_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days from now
    bank_account_last_four: '4567',
    bank_name: 'ITAÚ UNIBANCO',
    ownership_status: 'LINKED_TO_GUARANTEE',
    contract_effect: {
      creditor_institution: 'Banco Itaú',
      effect_type: 'DOMICILE_LOCK',
      registration_date: '2026-03-01',
      registrar: 'CERC'
    }
  },
  {
    id: 'set_004',
    transaction_id: 'tx_123459',
    amount_gross: 500.00,
    amount_net: 485.00,
    fee_mdr: 15.00,
    fee_anticipation: 12.50,
    status: 'SCHEDULED',
    settlement_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString(),
    bank_account_last_four: '4567',
    bank_name: 'ITAÚ UNIBANCO',
    ownership_status: 'ANTICIPATED'
  }
];

export const mockTerminals = [
  {
    id: 't_001',
    serial_number: 'SN-12345678',
    model: 'Pax A920',
    type: 'SMART_POS',
    status: 'ACTIVE',
    last_activity: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 mins ago
    version: '2.4.5',
    merchant_id: 'm_001'
  },
  {
    id: 't_002',
    serial_number: 'SN-87654321',
    model: 'Gertec MP35P',
    type: 'POS',
    status: 'OFFLINE',
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    version: '1.2.0',
    merchant_id: 'm_001'
  },
  {
    id: 't_003',
    serial_number: 'SN-55443322',
    model: 'Orion Gateway',
    type: 'E-COMMERCE',
    status: 'ACTIVE',
    last_activity: new Date(Date.now() - 1000 * 60 * 1).toISOString(), // 1 min ago
    version: 'v3.0.0-stable',
    merchant_id: 'm_001'
  },
  {
    id: 't_004',
    serial_number: 'SN-11223344',
    model: 'Pax D150',
    type: 'MOBILE',
    status: 'BLOCKED',
    last_activity: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 1 week ago
    version: '1.0.2',
    merchant_id: 'm_001'
  }
];
