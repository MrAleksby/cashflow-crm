// Временный mock сервис для транзакций
import type { Transaction } from '../types';

let mockTransactions: Transaction[] = [];

export const mockTransactionService = {
  async getClientTransactions(clientId: string): Promise<Transaction[]> {
    return new Promise(resolve => {
      setTimeout(() => {
        const clientTransactions = mockTransactions.filter(t => t.clientId === clientId);
        resolve([...clientTransactions]);
      }, 100);
    });
  },

  async createTransaction(transactionData: Omit<Transaction, 'id' | 'createdAt'>): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newTransaction: Transaction = {
          ...transactionData,
          id: `transaction_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        mockTransactions.push(newTransaction);
        resolve(newTransaction.id);
      }, 100);
    });
  }
};
