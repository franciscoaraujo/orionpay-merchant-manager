import api from '@/lib/api';

export const WithdrawalService = {
  async requestWithdrawal(merchantId: string, amount: number, pixKey: string): Promise<number> {
    const response = await api.post(
      `/merchants/withdrawals`,
      { merchantId, amount, pixKey }
    );
    return response.status;
  },
};
