import { clientService } from './clientService';
import { transactionService } from './transactionService';
import type { CampaignStats } from '../types';

export const analyticsService = {
  // Получить статистику по рекламным кампаниям
  async getCampaignStats(): Promise<CampaignStats[]> {
    try {
      const clients = await clientService.getAllClients();
      const transactions = await transactionService.getAllTransactions();

      // Группируем клиентов по кампаниям
      const campaignMap = new Map<string, {
        clients: string[];
        revenue: number;
      }>();

      clients.forEach(client => {
        const campaign = client.campaignSource || 'Без источника';
        
        if (!campaignMap.has(campaign)) {
          campaignMap.set(campaign, {
            clients: [],
            revenue: 0
          });
        }

        const data = campaignMap.get(campaign)!;
        data.clients.push(client.id);
      });

      // Считаем выручку по кампаниям
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          const client = clients.find(c => c.id === transaction.clientId);
          if (client) {
            const campaign = client.campaignSource || 'Без источника';
            const data = campaignMap.get(campaign);
            if (data) {
              data.revenue += transaction.amount;
            }
          }
        }
      });

      // Формируем результат
      const stats: CampaignStats[] = [];
      campaignMap.forEach((data, campaignName) => {
        stats.push({
          campaignName,
          clientCount: data.clients.length,
          totalRevenue: data.revenue,
          averageRevenue: data.clients.length > 0 ? data.revenue / data.clients.length : 0
        });
      });

      return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
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

      // Фильтруем транзакции по периоду
      const transactions = allTransactions.filter(t => {
        return t.date >= startDate && t.date <= endDate;
      });

      const campaignMap = new Map<string, {
        clients: Set<string>;
        revenue: number;
      }>();

      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          const client = clients.find(c => c.id === transaction.clientId);
          if (client) {
            const campaign = client.campaignSource || 'Без источника';
            
            if (!campaignMap.has(campaign)) {
              campaignMap.set(campaign, {
                clients: new Set(),
                revenue: 0
              });
            }

            const data = campaignMap.get(campaign)!;
            data.clients.add(client.id);
            data.revenue += transaction.amount;
          }
        }
      });

      const stats: CampaignStats[] = [];
      campaignMap.forEach((data, campaignName) => {
        const clientCount = data.clients.size;
        stats.push({
          campaignName,
          clientCount,
          totalRevenue: data.revenue,
          averageRevenue: clientCount > 0 ? data.revenue / clientCount : 0
        });
      });

      return stats.sort((a, b) => b.totalRevenue - a.totalRevenue);
    } catch (error) {
      console.error('Error getting campaign stats by period:', error);
      throw error;
    }
  }
};

