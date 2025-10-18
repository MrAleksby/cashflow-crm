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
import type { Campaign } from '../types';

const CAMPAIGNS_COLLECTION = 'campaigns';

export const campaignService = {
  // Получить все кампании
  async getAllCampaigns(): Promise<Campaign[]> {
    try {
      const q = query(collection(db, CAMPAIGNS_COLLECTION), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Campaign));
    } catch (error) {
      console.error('Error getting campaigns:', error);
      throw error;
    }
  },

  // Получить кампанию по ID
  async getCampaignById(id: string): Promise<Campaign | null> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Campaign;
      }
      return null;
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  },

  // Получить кампанию по названию
  async getCampaignByName(name: string): Promise<Campaign | null> {
    try {
      const campaigns = await this.getAllCampaigns();
      return campaigns.find(c => c.name === name) || null;
    } catch (error) {
      console.error('Error finding campaign:', error);
      throw error;
    }
  },

  // Создать новую кампанию
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = new Date().toISOString();
      const docRef = await addDoc(collection(db, CAMPAIGNS_COLLECTION), {
        ...campaignData,
        createdAt: now,
        updatedAt: now,
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  },

  // Обновить кампанию
  async updateCampaign(id: string, campaignData: Partial<Campaign>): Promise<void> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
      await updateDoc(docRef, {
        ...campaignData,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  },

  // Удалить кампанию
  async deleteCampaign(id: string): Promise<void> {
    try {
      const docRef = doc(db, CAMPAIGNS_COLLECTION, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }
};

