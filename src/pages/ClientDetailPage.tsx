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
  const [showAddBalance, setShowAddBalance] = useState(false);
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

  const handleAddBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client || !id) return;

    try {
      const amountNum = Number(amount);
      const newBalance = client.balance + amountNum;
      
      await clientService.updateBalance(id, newBalance);
      await transactionService.createTransaction({
        clientId: id,
        type: 'income',
        amount: amountNum,
        description: description || 'Пополнение баланса',
        date: new Date().toISOString()
      });

      setAmount('');
      setDescription('');
      setShowAddBalance(false);
      loadData(id);
    } catch (error) {
      console.error('Error adding balance:', error);
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
                <h2 className="text-xl font-semibold mb-4">Родители</h2>
                <div className="space-y-3">
                  {client.parents.map(parent => (
                    <div key={parent.id} className="border border-gray-200 rounded-lg p-4">
                      <p className="font-semibold">{parent.name}</p>
                      {parent.birthDate && (
                        <p className="text-sm text-gray-600">
                          Дата рождения: {format(new Date(parent.birthDate), 'dd.MM.yyyy')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Баланс и транзакции */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Баланс</h2>
              <div className={`text-3xl font-bold mb-4 ${
                client.balance > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(client.balance)}
              </div>
              
              {!showAddBalance ? (
                <button
                  onClick={() => setShowAddBalance(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                >
                  + Пополнить баланс
                </button>
              ) : (
                <form onSubmit={handleAddBalance} className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Сумма</label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Введите сумму"
                      required
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Описание</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      placeholder="Необязательно"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                    >
                      Пополнить
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddBalance(false);
                        setAmount('');
                        setDescription('');
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
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
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
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

