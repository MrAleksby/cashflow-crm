import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Transaction } from '../types';

const TRANSACTIONS_COLLECTION = 'transactions';

export const transactionService = {
  // Получить все транзакции клиента
  async getClientTransactions(clientId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('clientId', '==', clientId)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      // Сортируем на клиенте
      return transactions.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  },

  // Создать транзакцию
  async createTransaction(
    transactionData: Omit<Transaction, 'id' | 'createdAt'>
  ): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, TRANSACTIONS_COLLECTION), {
        ...transactionData,
        createdAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Получить транзакции за период
  async getTransactionsByDateRange(
    clientId: string,
    startDate: string,
    endDate: string
  ): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        where('clientId', '==', clientId),
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const querySnapshot = await getDocs(q);
      const transactions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
      
      // Сортируем на клиенте
      return transactions.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Error getting transactions by date range:', error);
      throw error;
    }
  },

  // Получить все транзакции
  async getAllTransactions(): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, TRANSACTIONS_COLLECTION),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Transaction));
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw error;
    }
  }
};

