import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockClientService as clientService } from '../services/mockClientService';
import type { Client } from '../types';
import Navbar from '../components/Navbar';

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientService.getAllClients();
      setClients(data);
    } catch (error) {
      console.error('Error loading clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = clients.filter(client => {
    const search = searchTerm.toLowerCase();
    return (
      client.phoneNumber.includes(search) ||
      client.children.some(child => child.name.toLowerCase().includes(search)) ||
      client.parents.some(parent => 
        parent.name.toLowerCase().includes(search) || 
        parent.phoneNumber?.includes(search) ||
        parent.relation?.toLowerCase().includes(search)
      ) ||
      client.campaignSource.toLowerCase().includes(search)
    );
  });

  const formatPhoneNumber = (phone: string) => {
    return `+998 ${phone}`;
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Клиенты</h1>
          <Link
            to="/clients/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            + Добавить клиента
          </Link>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Поиск по телефону, имени ребенка, родителя или кампании..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">
              {searchTerm ? 'Клиенты не найдены' : 'Нет клиентов. Добавьте первого клиента!'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 relative"
              >
                <Link to={`/clients/${client.id}`} className="block">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Телефон</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {formatPhoneNumber(client.phoneNumber)}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (client.classesRemaining ?? 0) > 0 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {client.classesRemaining ?? 0} {(client.classesRemaining ?? 0) === 1 ? 'занятие' : 'занятий'}
                    </div>
                  </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-500 mb-2">Дети</p>
                  {client.children.length > 0 ? (
                    <div className="space-y-1">
                      {client.children.map(child => (
                        <p key={child.id} className="text-gray-800">
                          {child.name} ({child.age} лет)
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 italic">Не указано</p>
                  )}
                </div>

                  {client.campaignSource && (
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500">Источник</p>
                      <p className="text-sm text-blue-600 font-medium">{client.campaignSource}</p>
                    </div>
                  )}
                </Link>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex space-x-2">
                  <Link
                    to={`/clients/${client.id}/edit`}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-md text-sm transition"
                  >
                    ✏️ Редактировать
                  </Link>
                  <Link
                    to={`/clients/${client.id}`}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center py-2 px-4 rounded-md text-sm transition"
                  >
                    👁️ Подробнее
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientsPage;

