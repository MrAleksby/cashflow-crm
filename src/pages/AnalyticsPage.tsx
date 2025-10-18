import React, { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import type { CampaignStats } from '../types';
import Navbar from '../components/Navbar';

const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<CampaignStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getCampaignStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterByDate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return; // Защита от повторного клика
    
    try {
      setSaving(true);
      const data = await analyticsService.getCampaignStatsByPeriod(startDate, endDate);
      setStats(data);
      setShowDateFilter(false);
    } catch (error) {
      console.error('Error loading filtered stats:', error);
      alert('Ошибка при загрузке статистики');
    } finally {
      setSaving(false);
    }
  };

  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setShowDateFilter(false);
    loadStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сум';
  };

  const totalClients = stats.reduce((sum, stat) => sum + stat.clientCount, 0);
  const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
  const totalCost = stats.reduce((sum, stat) => sum + stat.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const averageROI = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Аналитика рекламных кампаний</h1>
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            {showDateFilter ? 'Скрыть фильтр' : 'Фильтр по периоду'}
          </button>
        </div>

        {showDateFilter && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Фильтр по периоду</h2>
            <form onSubmit={handleFilterByDate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата начала
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата окончания
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Загрузка...' : 'Применить'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleResetFilter}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Сбросить
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Общая статистика */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Всего клиентов</p>
            <p className="text-4xl font-bold text-blue-600">{totalClients}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Общая выручка</p>
            <p className="text-4xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Затраты на рекламу</p>
            <p className="text-4xl font-bold text-red-600">{formatCurrency(totalCost)}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-600 mb-2">Средний ROI</p>
            <p className={`text-4xl font-bold ${averageROI > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {averageROI.toFixed(1)}%
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">Нет данных для отображения</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Рекламная кампания
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Клиентов
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Выручка
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Затраты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Прибыль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ROI
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.map((stat, index) => {
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-3" 
                                 style={{ backgroundColor: `hsl(${index * 60}, 70%, 50%)` }}></div>
                            <div className="text-sm font-medium text-gray-900">
                              {stat.campaignName}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{stat.clientCount}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-green-600">
                            {formatCurrency(stat.totalRevenue)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-red-600">
                            {formatCurrency(stat.cost)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-semibold ${stat.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(stat.profit)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-lg font-bold mr-2 ${stat.roi > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stat.roi.toFixed(1)}%
                            </span>
                            {stat.roi > 100 && <span className="text-green-500">🔥</span>}
                            {stat.roi > 0 && stat.roi <= 100 && <span className="text-yellow-500">📈</span>}
                            {stat.roi <= 0 && <span className="text-red-500">📉</span>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Как рассчитывается ROI?
          </h3>
          <p className="text-blue-800 text-sm">
            ROI (Return on Investment) = (Общая выручка - Затраты на рекламу) / Затраты на рекламу × 100%
          </p>
          <p className="text-blue-700 text-sm mt-2">
            Для полного расчета ROI добавьте информацию о затратах на каждую рекламную кампанию.
            В текущей версии показана только выручка по каждой кампании.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

