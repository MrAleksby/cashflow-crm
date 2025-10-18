import { clientService } from './clientService';
import { transactionService } from './transactionService';
import { campaignService } from './campaignService';
import type { CampaignStats } from '../types';

export const analyticsService = {
  // Получить статистику по рекламным кампаниям
  async getCampaignStats(): Promise<CampaignStats[]> {
    try {
      const clients = await clientService.getAllClients();
      const transactions = await transactionService.getAllTransactions();
      const campaigns = await campaignService.getAllCampaigns();

      // Создаем карту кампаний для быстрого поиска
      const campaignCostMap = new Map<string, { id: string; cost: number }>();
      campaigns.forEach(campaign => {
        campaignCostMap.set(campaign.name, { id: campaign.id, cost: campaign.cost });
      });

      // Группируем клиентов по кампаниям
      const campaignMap = new Map<string, {
        id?: string;
        clients: string[];
        revenue: number;
        cost: number;
      }>();

      clients.forEach(client => {
        const campaignName = client.campaignSource || 'Без источника';
        
        if (!campaignMap.has(campaignName)) {
          const campaignInfo = campaignCostMap.get(campaignName);
          campaignMap.set(campaignName, {
            id: campaignInfo?.id,
            clients: [],
            revenue: 0,
            cost: campaignInfo?.cost || 0
          });
        }

        const data = campaignMap.get(campaignName)!;
        data.clients.push(client.id);
      });

      // Считаем выручку по кампаниям
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          const client = clients.find(c => c.id === transaction.clientId);
          if (client) {
            const campaignName = client.campaignSource || 'Без источника';
            const data = campaignMap.get(campaignName);
            if (data) {
              data.revenue += transaction.amount;
            }
          }
        }
      });

      // Формируем результат с расчетом ROI
      const stats: CampaignStats[] = [];
      campaignMap.forEach((data, campaignName) => {
        const profit = data.revenue - data.cost;
        const roi = data.cost > 0 ? (profit / data.cost) * 100 : 0;
        
        stats.push({
          campaignName,
          campaignId: data.id,
          clientCount: data.clients.length,
          totalRevenue: data.revenue,
          averageRevenue: data.clients.length > 0 ? data.revenue / data.clients.length : 0,
          cost: data.cost,
          roi: roi,
          profit: profit
        });
      });

      return stats.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error('Error getting campaign stats:', error);
      throw error;
    }
  },

  // Получить статистику по кампании за период
  async getCampaignStatsByPeriod(
    startDate: string,
    endDate: string
  ): Promise<CampaignStats[]> {
    try {
      const clients = await clientService.getAllClients();
      const allTransactions = await transactionService.getAllTransactions();
      const campaigns = await campaignService.getAllCampaigns();

      // Создаем карту кампаний для быстрого поиска
      const campaignCostMap = new Map<string, { id: string; cost: number }>();
      campaigns.forEach(campaign => {
        campaignCostMap.set(campaign.name, { id: campaign.id, cost: campaign.cost });
      });

      // Фильтруем транзакции по периоду
      const transactions = allTransactions.filter(t => {
        return t.date >= startDate && t.date <= endDate;
      });

      const campaignMap = new Map<string, {
        id?: string;
        clients: Set<string>;
        revenue: number;
        cost: number;
      }>();

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          const client = clients.find(c => c.id === transaction.clientId);
          if (client) {
            const campaignName = client.campaignSource || 'Без источника';
            
            if (!campaignMap.has(campaignName)) {
              const campaignInfo = campaignCostMap.get(campaignName);
              campaignMap.set(campaignName, {
                id: campaignInfo?.id,
                clients: new Set(),
                revenue: 0,
                cost: campaignInfo?.cost || 0
              });
            }

            const data = campaignMap.get(campaignName)!;
            data.clients.add(client.id);
            data.revenue += transaction.amount;
          }
        }
      });

      const stats: CampaignStats[] = [];
      campaignMap.forEach((data, campaignName) => {
        const clientCount = data.clients.size;
        const profit = data.revenue - data.cost;
        const roi = data.cost > 0 ? (profit / data.cost) * 100 : 0;
        
        stats.push({
          campaignName,
          campaignId: data.id,
          clientCount,
          totalRevenue: data.revenue,
          averageRevenue: clientCount > 0 ? data.revenue / clientCount : 0,
          cost: data.cost,
          roi: roi,
          profit: profit
        });
      });

      return stats.sort((a, b) => b.roi - a.roi);
    } catch (error) {
      console.error('Error getting campaign stats by period:', error);
      throw error;
    }
  }
};

