// Типы для системы CRM

export interface Child {
  id: string;
  name: string;
  birthDate: string;
  age: number;
  school: string;
}

export interface Parent {
  id: string;
  name: string;
  birthDate: string;
}

export interface Transaction {
  id: string;
  clientId: string;
  type: 'income' | 'expense'; // покупка занятий или списание занятия
  amount: number; // сумма оплаты
  classesCount?: number; // количество занятий (для покупки)
  description: string;
  date: string;
  createdAt: string;
}

export interface Client {
  id: string;
  phoneNumber: string; // логин (9 цифр)
  children: Child[];
  parents: Parent[];
  classesRemaining: number; // количество оставшихся занятий
  campaignSource: string; // рекламная кампания
  createdAt: string;
  updatedAt: string;
}

export interface ClassSession {
  id: string;
  date: string; // дата занятия
  time: string; // время занятия
  registeredChildren: {
    clientId: string;
    childId: string;
    childName: string;
    attended: boolean; // пришел ли на занятие
    paid: boolean; // списана ли оплата
  }[];
  createdAt: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  role: 'admin';
}

export interface Campaign {
  id: string;
  name: string;
  cost: number; // затраты на рекламу
  description?: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignStats {
  campaignName: string;
  campaignId?: string;
  clientCount: number;
  totalRevenue: number;
  averageRevenue: number;
  cost: number; // затраты на кампанию
  roi: number; // ROI в процентах
  profit: number; // прибыль (выручка - затраты)
}

