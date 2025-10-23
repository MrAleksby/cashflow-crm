// Временный mock сервис для тестирования без Firebase
import type { Client } from '../types';

let mockClients: Client[] = [
  {
    id: '1',
    phoneNumber: '901234567',
    children: [
      {
        id: 'child1',
        name: 'Тестовый ребенок',
        birthDate: '2015-01-01',
        age: 9,
        school: 'Тестовая школа'
      }
    ],
    parents: [
      {
        id: 'parent1',
        name: 'Тестовый родитель',
        phoneNumber: '901234567',
        relation: 'Мама',
        birthDate: '1985-01-01'
      }
    ],
    classesRemaining: 5,
    moneyBalance: 0,
    campaignSource: 'Тест',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const mockClientService = {
  async getAllClients(): Promise<Client[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([...mockClients]), 100);
    });
  },

  async getClientById(id: string): Promise<Client | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const client = mockClients.find(c => c.id === id);
        resolve(client || null);
      }, 100);
    });
  },

  async createClient(clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newClient: Client = {
          ...clientData,
          id: `client_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        mockClients.push(newClient);
        resolve(newClient.id);
      }, 100);
    });
  },

  async updateClient(id: string, clientData: Partial<Client>): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = mockClients.findIndex(c => c.id === id);
        if (index !== -1) {
          mockClients[index] = { ...mockClients[index], ...clientData, updatedAt: new Date().toISOString() };
        }
        resolve();
      }, 100);
    });
  },

  async deleteClient(id: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        mockClients = mockClients.filter(c => c.id !== id);
        resolve();
      }, 100);
    });
  },

  async addClasses(id: string, classesCount: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const client = mockClients.find(c => c.id === id);
        if (client) {
          client.classesRemaining += classesCount;
          client.updatedAt = new Date().toISOString();
        }
        resolve();
      }, 100);
    });
  },

  async deductClass(id: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const client = mockClients.find(c => c.id === id);
        if (client && client.classesRemaining > 0) {
          client.classesRemaining -= 1;
          client.updatedAt = new Date().toISOString();
        }
        resolve();
      }, 100);
    });
  },

  async addMoney(id: string, amount: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const client = mockClients.find(c => c.id === id);
        if (client) {
          client.moneyBalance += amount;
          client.updatedAt = new Date().toISOString();
        }
        resolve();
      }, 100);
    });
  },

  async deductMoney(id: string, amount: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const client = mockClients.find(c => c.id === id);
        if (client && client.moneyBalance >= amount) {
          client.moneyBalance -= amount;
          client.updatedAt = new Date().toISOString();
        }
        resolve();
      }, 100);
    });
  }
};
