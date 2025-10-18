import React, { useState, useEffect } from 'react';
import { classService } from '../services/classService';
import { clientService } from '../services/clientService';
import type { ClassSession, Client } from '../types';
import Navbar from '../components/Navbar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showRegisterChild, setShowRegisterChild] = useState<string | null>(null);
  
  // Форма создания занятия
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassTime, setNewClassTime] = useState('');
  const [newClassPrice, setNewClassPrice] = useState('');

  // Форма записи ребенка
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedChild, setSelectedChild] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classesData, clientsData] = await Promise.all([
        classService.getAllClasses(),
        clientService.getAllClients()
      ]);
      setClasses(classesData);
      setClients(clientsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await classService.createClass({
        date: newClassDate,
        time: newClassTime,
        price: Number(newClassPrice),
        registeredChildren: []
      });

      setNewClassDate('');
      setNewClassTime('');
      setNewClassPrice('');
      setShowCreateClass(false);
      loadData();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleRegisterChild = async (e: React.FormEvent, classId: string) => {
    e.preventDefault();
    
    if (!selectedClient || !selectedChild) return;

    try {
      const client = clients.find(c => c.id === selectedClient);
      const child = client?.children.find(ch => ch.id === selectedChild);
      
      if (!client || !child) return;

      await classService.registerChild(classId, client.id, child.id, child.name);
      
      setSelectedClient('');
      setSelectedChild('');
      setShowRegisterChild(null);
      loadData();
    } catch (error) {
      console.error('Error registering child:', error);
      alert('Ошибка при записи ребенка');
    }
  };

  const handleMarkAttendance = async (classId: string, clientId: string, childId: string) => {
    if (!window.confirm('Отметить посещение и списать деньги с баланса?')) {
      return;
    }

    try {
      await classService.markAttendance(classId, clientId, childId);
      loadData();
      alert('Посещение отмечено, деньги списаны');
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(error.message || 'Ошибка при отметке посещения');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' сум';
  };

  const selectedClientData = clients.find(c => c.id === selectedClient);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Занятия</h1>
          <button
            onClick={() => setShowCreateClass(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            + Создать занятие
          </button>
        </div>

        {showCreateClass && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Новое занятие</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дата
                  </label>
                  <input
                    type="date"
                    value={newClassDate}
                    onChange={(e) => setNewClassDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Время
                  </label>
                  <input
                    type="time"
                    value={newClassTime}
                    onChange={(e) => setNewClassTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Стоимость (сум)
                  </label>
                  <input
                    type="number"
                    value={newClassPrice}
                    onChange={(e) => setNewClassPrice(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateClass(false);
                    setNewClassDate('');
                    setNewClassTime('');
                    setNewClassPrice('');
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 text-lg">Нет занятий. Создайте первое занятие!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {classes.map(classSession => (
              <div key={classSession.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {format(new Date(classSession.date), 'dd MMMM yyyy', { locale: ru })}
                    </h3>
                    <p className="text-gray-600">Время: {classSession.time}</p>
                    <p className="text-blue-600 font-semibold">{formatCurrency(classSession.price)}</p>
                  </div>
                  
                  <button
                    onClick={() => setShowRegisterChild(
                      showRegisterChild === classSession.id ? null : classSession.id
                    )}
                    className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                  >
                    + Записать ребенка
                  </button>
                </div>

                {showRegisterChild === classSession.id && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <form onSubmit={(e) => handleRegisterChild(e, classSession.id)} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Клиент
                          </label>
                          <select
                            value={selectedClient}
                            onChange={(e) => {
                              setSelectedClient(e.target.value);
                              setSelectedChild('');
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Выберите клиента</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>
                                {client.phoneNumber} - {client.children.map(c => c.name).join(', ')}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ребенок
                          </label>
                          <select
                            value={selectedChild}
                            onChange={(e) => setSelectedChild(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!selectedClient}
                          >
                            <option value="">Выберите ребенка</option>
                            {selectedClientData?.children.map(child => (
                              <option key={child.id} value={child.id}>
                                {child.name} ({child.age} лет)
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                        >
                          Записать
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowRegisterChild(null);
                            setSelectedClient('');
                            setSelectedChild('');
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-3">
                    Записано детей: {classSession.registeredChildren.length}
                  </h4>
                  
                  {classSession.registeredChildren.length > 0 ? (
                    <div className="space-y-2">
                      {classSession.registeredChildren.map((registration, index) => (
                        <div
                          key={index}
                          className={`flex justify-between items-center p-3 rounded-md ${
                            registration.attended 
                              ? 'bg-green-50 border border-green-200' 
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <div>
                            <p className="font-medium">{registration.childName}</p>
                            <p className="text-sm text-gray-600">
                              {registration.attended 
                                ? '✓ Присутствовал, оплачено' 
                                : 'Записан'}
                            </p>
                          </div>
                          
                          {!registration.attended && (
                            <button
                              onClick={() => handleMarkAttendance(
                                classSession.id,
                                registration.clientId,
                                registration.childId
                              )}
                              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-4 rounded-md text-sm transition"
                            >
                              Отметить посещение
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm">Нет записей</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;

