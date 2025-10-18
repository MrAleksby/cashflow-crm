import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Client } from '../types';

const CLIENTS_COLLECTION = 'clients';

export const clientService = {
  // Получить всех клиентов
  async getAllClients(): Promise<Client[]> {
    try {
      const q = query(collection(db, CLIENTS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Client));
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  },

  // Получить клиента по ID
  async getClientById(id: string): Promise<Client | null> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Client;
      }
      return null;
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  },

  // Создать нового клиента
  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, CLIENTS_COLLECTION), {
        ...clientData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Обновить клиента
  async updateClient(id: string, clientData: Partial<Client>): Promise<void> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      await updateDoc(docRef, {
        ...clientData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Удалить клиента
  async deleteClient(id: string): Promise<void> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  },

  // Обновить баланс клиента
  async updateBalance(id: string, newBalance: number): Promise<void> {
    try {
      const docRef = doc(db, CLIENTS_COLLECTION, id);
      await updateDoc(docRef, {
        balance: newBalance,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating balance:', error);
      throw error;
    }
  },

  // Поиск клиента по номеру телефона
  async findClientByPhone(phoneNumber: string): Promise<Client | null> {
    try {
      const clients = await this.getAllClients();
      return clients.find(c => c.phoneNumber === phoneNumber) || null;
    } catch (error) {
      console.error('Error finding client:', error);
      throw error;
    }
  }
};

