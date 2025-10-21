import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { transactionService } from '../services/transactionService';
import type { Client, Transaction } from '../types';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';

const ClientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [client, setClient] = useState<Client | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showBuyClasses, setShowBuyClasses] = useState(false);
  const [classesCount, setClassesCount] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (id) {
      loadData(id);
    }
  }, [id]);

  const loadData = async (clientId: string) => {
    try {
      setLoading(true);
      const [clientData, transactionsData] = await Promise.all([
        clientService.getClientById(clientId),
        transactionService.getClientTransactions(clientId)
      ]);
      setClient(clientData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBuyClasses = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (saving) return; // Защита от повторного клика
    if (!client || !id) return;

    try {
      setSaving(true);
      const classesNum = Number(classesCount);
      const amountNum = Number(amount);
      
      if (classesNum <= 0) {
        alert('Количество занятий должно быть больше 0');
        return;
      }

      if (amountNum < 0) {
        alert('Сумма не может быть отрицательной');
        return;
      }
      
      await clientService.addClasses(id, classesNum);
      await transactionService.createTransaction({
        clientId: id,
        type: 'income',
        amount: amountNum,
        classesCount: classesNum,
        description: description || `Покупка ${classesNum} занятий за ${formatCurrency(amountNum)}`,
        date: new Date().toISOString()
      });

      setClassesCount('');
      setAmount('');
      setDescription('');
      setShowBuyClasses(false);
      await loadData(id);
    } catch (error) {
      console.error('Error buying classes:', error);
      alert('Ошибка при покупке занятий');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Вы уверены, что хотите удалить этого клиента?')) {
      return;
    }

    try {
      await clientService.deleteClient(id);
      navigate('/');
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сум';
  };

  const formatPhoneNumber = (phone: string) => {
    return `+998 ${phone}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="text-center py-12">
          <p className="text-gray-600">Клиент не найден</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Карточка клиента</h1>
          <div className="flex space-x-3">
            <Link
              to={`/clients/${id}/edit`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition"
            >
              Редактировать
            </Link>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition"
            >
              Удалить
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Основная информация */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Основная информация</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="text-lg font-semibold">{formatPhoneNumber(client.phoneNumber)}</p>
                </div>
                {client.campaignSource && (
                  <div>
                    <p className="text-sm text-gray-500">Источник</p>
                    <p className="text-lg">{client.campaignSource}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Дети</h2>
              {client.children.length > 0 ? (
                <div className="space-y-4">
                  {client.children.map(child => (
                    <div key={child.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-lg mb-2">{child.name}</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-gray-500">Возраст</p>
                          <p>{child.age} лет</p>
                        </div>
                        {child.school && (
                          <div>
                            <p className="text-gray-500">Школа</p>
                            <p>{child.school}</p>
                          </div>
                        )}
                        {child.birthDate && (
                          <div>
                            <p className="text-gray-500">Дата рождения</p>
                            <p>{format(new Date(child.birthDate), 'dd.MM.yyyy')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">Нет информации о детях</p>
              )}
            </div>

            {client.parents.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Контактные лица</h2>
                <div className="space-y-3">
                  {client.parents.map(parent => (
                    <div key={parent.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-lg">{parent.name}</p>
                          {parent.relation && (
                            <p className="text-sm text-blue-600">{parent.relation}</p>
                          )}
                        </div>
                      </div>
                      {parent.phoneNumber && (
                        <p className="text-gray-800 mb-1">
                          📞 <a href={`tel:+998${parent.phoneNumber}`} className="hover:text-blue-600">
                            +998 {parent.phoneNumber}
                          </a>
                        </p>
                      )}
                      {parent.birthDate && (
                        <p className="text-sm text-gray-600">
                          🎂 {format(new Date(parent.birthDate), 'dd.MM.yyyy')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Занятия и транзакции */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Доступные занятия</h2>
              <div className={`text-3xl font-bold mb-4 ${
                (client.classesRemaining ?? 0) > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {client.classesRemaining ?? 0} {(client.classesRemaining ?? 0) === 1 ? 'занятие' : 'занятий'}
              </div>
              
              {!showBuyClasses ? (
                <button
                  onClick={() => setShowBuyClasses(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                >
                  💳 Купить занятия
                </button>
              ) : (
                <form onSubmit={handleBuyClasses} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Количество занятий</label>
                    <input
                      type="number"
                      value={classesCount}
                      onChange={(e) => setClassesCount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: 4"
                      required
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Сумма оплаты (сум)</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: 1250000"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Описание (необязательно)</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Например: Пакет на месяц"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Оформление...' : 'Купить'}
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => {
                        setShowBuyClasses(false);
                        setClassesCount('');
                        setAmount('');
                        setDescription('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">История транзакций</h2>
              {transactions.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {transactions.map(transaction => (
                    <div key={transaction.id} className="border-l-4 pl-3 py-2"
                         style={{ borderColor: transaction.type === 'income' ? '#10b981' : '#ef4444' }}>
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' 
                              ? `+${transaction.classesCount || 0} занятий` 
                              : `-1 занятие`
                            }
                          </p>
                          {transaction.amount > 0 && (
                            <p className="text-xs text-gray-600">
                              {formatCurrency(transaction.amount)}
                            </p>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          {format(new Date(transaction.date), 'dd.MM.yyyy HH:mm')}
                        </p>
                      </div>
                      <p className="text-sm text-gray-600">{transaction.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">Нет транзакций</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailPage;

