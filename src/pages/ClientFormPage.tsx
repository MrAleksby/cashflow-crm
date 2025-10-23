import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mockClientService as clientService } from '../services/mockClientService';
import { campaignService } from '../services/campaignService';
import type { Child, Parent, Campaign } from '../types';
import Navbar from '../components/Navbar';

const ClientFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [classesRemaining, setClassesRemaining] = useState(0);
  const [moneyBalance, setMoneyBalance] = useState(0);
  const [campaignSource, setCampaignSource] = useState('');
  const [children, setChildren] = useState<Child[]>([]);
  const [parents, setParents] = useState<Parent[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // При создании нового клиента добавляем по умолчанию 1 ребенка и 1 родителя
  useEffect(() => {
    if (!isEdit) {
      setChildren([{ id: '', name: '', birthDate: '', age: 0, school: '' }]);
      setParents([{ id: '', name: '', phoneNumber: '', relation: '', birthDate: '' }]);
    }
  }, []); // Выполняется один раз при монтировании

  useEffect(() => {
    loadCampaigns();
    if (isEdit && id) {
      loadClient(id);
    }
  }, [id, isEdit]);

  const loadCampaigns = async () => {
    try {
      const campaignsData = await campaignService.getAllCampaigns();
      setCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const loadClient = async (clientId: string) => {
    try {
      const client = await clientService.getClientById(clientId);
      if (client) {
        setClassesRemaining(client.classesRemaining ?? 0);
        setMoneyBalance(client.moneyBalance ?? 0);
        setCampaignSource(client.campaignSource);
        setChildren(client.children);
        setParents(client.parents);
      }
    } catch (error) {
      console.error('Error loading client:', error);
      setError('Ошибка загрузки клиента');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return; // Защита от повторного клика

    if (children.length === 0) {
      setError('Добавьте хотя бы одного ребенка');
      return;
    }

    if (parents.length === 0) {
      setError('Добавьте хотя бы одного родителя');
      return;
    }

    // Проверяем номер телефона, если он указан
    const firstParent = parents[0];
    if (firstParent.phoneNumber && (firstParent.phoneNumber.length !== 9 || !/^\d+$/.test(firstParent.phoneNumber))) {
      setError('Номер телефона должен содержать ровно 9 цифр');
      return;
    }

    try {
      setError('');
      setSaving(true);

      // Используем номер первого родителя как основной номер клиента
      // Если номера нет, генерируем уникальный ID
      const phoneNumber = firstParent.phoneNumber || `temp_${Date.now()}`;

      const clientData = {
        phoneNumber,
        classesRemaining,
        moneyBalance,
        campaignSource,
        children: children.map((child) => 
          child.id ? child : {
            ...child,
            id: `child_${Date.now()}_${Math.random()}`
          }
        ),
        parents: parents.map((parent) => 
          parent.id ? parent : {
            ...parent,
            id: `parent_${Date.now()}_${Math.random()}`
          }
        )
      };

      if (isEdit && id) {
        await clientService.updateClient(id, clientData);
      } else {
        await clientService.createClient(clientData);
      }

      navigate('/');
    } catch (err) {
      setError('Ошибка сохранения клиента');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addChild = () => {
    setChildren([...children, { id: '', name: '', birthDate: '', age: 0, school: '' }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: keyof Child, value: string | number) => {
    const updated = [...children];
    updated[index] = { ...updated[index], [field]: value };
    setChildren(updated);
  };

  const addParent = () => {
    setParents([...parents, { id: '', name: '', phoneNumber: '', relation: '', birthDate: '' }]);
  };

  const removeParent = (index: number) => {
    setParents(parents.filter((_, i) => i !== index));
  };

  const updateParent = (index: number, field: keyof Parent, value: string) => {
    const updated = [...parents];
    updated[index] = { ...updated[index], [field]: value };
    setParents(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">
          {isEdit ? 'Редактировать клиента' : 'Добавить клиента'}
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Начальное количество занятий
              </label>
              <input
                type="number"
                value={classesRemaining}
                onChange={(e) => setClassesRemaining(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Например: 0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Обычно оставляют 0, клиент купит занятия потом
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Денежный баланс (сум)
              </label>
              <input
                type="number"
                value={moneyBalance}
                onChange={(e) => setMoneyBalance(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Например: 0"
                min="0"
              />
              <p className="text-xs text-gray-500 mt-1">
                Остаток денег на балансе клиента
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Рекламная кампания
            </label>
            <select
              value={campaignSource}
              onChange={(e) => setCampaignSource(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Без источника</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.name}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Дети *</h3>
              <button
                type="button"
                onClick={addChild}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition"
              >
                + Добавить ребенка
              </button>
            </div>
            
            {children.map((child, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Ребенок {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Удалить
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Имя *</label>
                    <input
                      type="text"
                      value={child.name}
                      onChange={(e) => updateChild(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Возраст *</label>
                    <input
                      type="number"
                      value={child.age}
                      onChange={(e) => updateChild(index, 'age', Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      min="0"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Дата рождения</label>
                    <input
                      type="date"
                      value={child.birthDate}
                      onChange={(e) => updateChild(index, 'birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Школа</label>
                    <input
                      type="text"
                      value={child.school}
                      onChange={(e) => updateChild(index, 'school', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">Родители *</h3>
              <button
                type="button"
                onClick={addParent}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm transition"
              >
                + Добавить родителя
              </button>
            </div>
            <p className="text-xs text-blue-600 mb-4">
              ℹ️ Номер телефона необязателен, можно добавить позже
            </p>
            
            {parents.map((parent, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-700">Родитель {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeParent(index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Удалить
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Имя</label>
                    <input
                      type="text"
                      value={parent.name}
                      onChange={(e) => updateParent(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: Феруза"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Кто это (отношение)</label>
                    <input
                      type="text"
                      value={parent.relation || ''}
                      onChange={(e) => updateParent(index, 'relation', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: Мама, Папа, Бабушка"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Номер телефона
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-700 bg-gray-100 border border-r-0 border-gray-300 rounded-l-md text-sm">
                        +998
                      </span>
                      <input
                        type="text"
                        value={parent.phoneNumber}
                        onChange={(e) => updateParent(index, 'phoneNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500"
                        placeholder="901234567 (необязательно)"
                        maxLength={9}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Дата рождения</label>
                    <input
                      type="date"
                      value={parent.birthDate}
                      onChange={(e) => updateParent(index, 'birthDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
            
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientFormPage;

