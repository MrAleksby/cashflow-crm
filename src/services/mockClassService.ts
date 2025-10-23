// Временный mock сервис для занятий
import type { ClassSession } from '../types';
import { mockClientService } from './mockClientService';

let mockClasses: ClassSession[] = [
  {
    id: 'class1',
    date: '2025-10-23',
    time: '10:00',
    registeredChildren: [
      {
        clientId: '1',
        childId: 'child1',
        childName: 'Тестовый ребенок',
        attended: false,
        paid: false
      }
    ],
    createdAt: new Date().toISOString()
  }
];

export const mockClassService = {
  async getAllClasses(): Promise<ClassSession[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([...mockClasses]), 100);
    });
  },

  async getClassById(id: string): Promise<ClassSession | null> {
    return new Promise(resolve => {
      setTimeout(() => {
        const classSession = mockClasses.find(c => c.id === id);
        resolve(classSession || null);
      }, 100);
    });
  },

  async createClass(classData: Omit<ClassSession, 'id' | 'createdAt'>): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        const newClass: ClassSession = {
          ...classData,
          id: `class_${Date.now()}`,
          createdAt: new Date().toISOString()
        };
        mockClasses.push(newClass);
        resolve(newClass.id);
      }, 100);
    });
  },

  async updateClass(id: string, classData: Partial<ClassSession>): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const index = mockClasses.findIndex(c => c.id === id);
        if (index !== -1) {
          mockClasses[index] = { ...mockClasses[index], ...classData };
        }
        resolve();
      }, 100);
    });
  },

  async deleteClass(id: string): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        mockClasses = mockClasses.filter(c => c.id !== id);
        resolve();
      }, 100);
    });
  },

  async registerChild(
    classId: string,
    clientId: string,
    childId: string,
    childName: string
  ): Promise<void> {
    return new Promise(resolve => {
      setTimeout(() => {
        const classSession = mockClasses.find(c => c.id === classId);
        if (classSession) {
          classSession.registeredChildren.push({
            clientId,
            childId,
            childName,
            attended: false,
            paid: false
          });
        }
        resolve();
      }, 100);
    });
  },

  async markAttendance(
    classId: string,
    clientId: string,
    childId: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const classSession = await this.getClassById(classId);
        if (!classSession) throw new Error('Занятие не найдено');

        const client = await mockClientService.getClientById(clientId);
        if (!client) throw new Error('Клиент не найден');

        // Проверяем, не отмечен ли уже ребенок
        const existingRegistration = classSession.registeredChildren.find(reg => 
          reg.clientId === clientId && reg.childId === childId
        );
        
        if (existingRegistration?.attended) {
          // Ребенок уже отмечен, ничего не делаем
          resolve();
          return;
        }

        // Проверяем наличие доступных занятий
        if (client.classesRemaining <= 0) {
          throw new Error(`У клиента нет доступных занятий. Осталось: ${client.classesRemaining}. Необходимо купить занятия.`);
        }

        // Обновляем статус посещения
        const updatedRegistrations = classSession.registeredChildren.map(reg => {
          if (reg.clientId === clientId && reg.childId === childId) {
            return { ...reg, attended: true, paid: true };
          }
          return reg;
        });

        // Списываем одно занятие
        await mockClientService.deductClass(clientId);

        // Обновляем занятие
        await this.updateClass(classId, {
          registeredChildren: updatedRegistrations
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  async cancelAttendance(
    classId: string,
    clientId: string,
    childId: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const classSession = await this.getClassById(classId);
        if (!classSession) throw new Error('Занятие не найдено');

        const client = await mockClientService.getClientById(clientId);
        if (!client) throw new Error('Клиент не найден');

        // Проверяем, не отменен ли уже ребенок
        const existingRegistration = classSession.registeredChildren.find(reg => 
          reg.clientId === clientId && reg.childId === childId
        );
        
        if (!existingRegistration?.attended) {
          // Ребенок уже не отмечен, ничего не делаем
          resolve();
          return;
        }

        // Обновляем статус посещения
        const updatedRegistrations = classSession.registeredChildren.map(reg => {
          if (reg.clientId === clientId && reg.childId === childId) {
            return { ...reg, attended: false, paid: false };
          }
          return reg;
        });

        // Возвращаем одно занятие на баланс
        await mockClientService.addClasses(clientId, 1);

        // Обновляем занятие
        await this.updateClass(classId, {
          registeredChildren: updatedRegistrations
        });

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
};
