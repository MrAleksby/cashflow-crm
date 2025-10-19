import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy
} from 'firebase/firestore';
import { db } from '../firebase/config';
import type { ClassSession } from '../types';
import { clientService } from './clientService';
import { transactionService } from './transactionService';

const CLASSES_COLLECTION = 'classes';

export const classService = {
  // Получить все занятия
  async getAllClasses(): Promise<ClassSession[]> {
    try {
      const querySnapshot = await getDocs(collection(db, CLASSES_COLLECTION));
      const classes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClassSession));
      
      // Сортируем на клиенте
      return classes.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error) {
      console.error('Error getting classes:', error);
      throw error;
    }
  },

  // Получить занятия по дате
  async getClassesByDate(date: string): Promise<ClassSession[]> {
    try {
      const q = query(
        collection(db, CLASSES_COLLECTION),
        where('date', '==', date)
      );
      const querySnapshot = await getDocs(q);
      const classes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ClassSession));
      
      // Сортируем на клиенте
      return classes.sort((a, b) => a.time.localeCompare(b.time));
    } catch (error) {
      console.error('Error getting classes by date:', error);
      throw error;
    }
  },

  // Создать новое занятие
  async createClass(classData: Omit<ClassSession, 'id' | 'createdAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, CLASSES_COLLECTION), {
        ...classData,
        createdAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  },

  // Обновить занятие
  async updateClass(id: string, classData: Partial<ClassSession>): Promise<void> {
    try {
      const docRef = doc(db, CLASSES_COLLECTION, id);
      await updateDoc(docRef, classData);
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  },

  // Удалить занятие
  async deleteClass(id: string): Promise<void> {
    try {
      const docRef = doc(db, CLASSES_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  },

  // Записать ребенка на занятие
  async registerChild(
    classId: string,
    clientId: string,
    childId: string,
    childName: string
  ): Promise<void> {
    try {
      const classDoc = await this.getClassById(classId);
      if (!classDoc) throw new Error('Class not found');

      const updatedRegistrations = [
        ...classDoc.registeredChildren,
        {
          clientId,
          childId,
          childName,
          attended: false,
          paid: false,
        }
      ];

      await this.updateClass(classId, {
        registeredChildren: updatedRegistrations
      });
    } catch (error) {
      console.error('Error registering child:', error);
      throw error;
    }
  },

  // Отметить посещение и списать одно занятие
  async markAttendance(
    classId: string,
    clientId: string,
    childId: string
  ): Promise<void> {
    try {
      const classDoc = await this.getClassById(classId);
      if (!classDoc) throw new Error('Занятие не найдено');

      const client = await clientService.getClientById(clientId);
      if (!client) throw new Error('Клиент не найден');

      // Проверяем наличие доступных занятий
      if (client.classesRemaining <= 0) {
        throw new Error(`У клиента нет доступных занятий. Осталось: ${client.classesRemaining}. Необходимо купить занятия.`);
      }

      // Обновляем статус посещения
      const updatedRegistrations = classDoc.registeredChildren.map(reg => {
        if (reg.clientId === clientId && reg.childId === childId) {
          return { ...reg, attended: true, paid: true };
        }
        return reg;
      });

      // Списываем одно занятие
      await clientService.deductClass(clientId);

      // Создаем транзакцию
      await transactionService.createTransaction({
        clientId,
        type: 'expense',
        amount: 0, // списание занятия, без оплаты
        classesCount: 1,
        description: `Списано занятие ${classDoc.date} ${classDoc.time}`,
        date: new Date().toISOString()
      });

      // Обновляем занятие
      await this.updateClass(classId, {
        registeredChildren: updatedRegistrations
      });
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  },

  // Получить занятие по ID
  async getClassById(id: string): Promise<ClassSession | null> {
    try {
      const docRef = doc(db, CLASSES_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as ClassSession;
      }
      return null;
    } catch (error) {
      console.error('Error getting class:', error);
      throw error;
    }
  }
};

