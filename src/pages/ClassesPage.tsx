import React, { useState, useEffect } from 'react';
import { classService } from '../services/classService';
import { clientService } from '../services/clientService';
import type { ClassSession, Client } from '../types';
import Navbar from '../components/Navbar';
import ClassCalendar from '../components/ClassCalendar';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassSession[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateClass, setShowCreateClass] = useState(false);
  const [showRegisterChild, setShowRegisterChild] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('calendar');
  const [savingClass, setSavingClass] = useState(false);
  const [savingRegistration, setSavingRegistration] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  
  // Форма создания/редактирования занятия
  const [newClassDate, setNewClassDate] = useState('');
  const [newClassTime, setNewClassTime] = useState('');

  // Форма записи ребенка
  const [selectedChildId, setSelectedChildId] = useState('');

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
    
    if (savingClass) return; // Защита от повторного клика
    
    try {
      setSavingClass(true);
      
      if (editingClassId) {
        // Обновляем существующее занятие
        await classService.updateClass(editingClassId, {
          date: newClassDate,
          time: newClassTime
        });
        
        // Обновляем state локально
        setClasses(prevClasses => prevClasses.map(cls => {
          if (cls.id === editingClassId) {
            return { ...cls, date: newClassDate, time: newClassTime };
          }
          return cls;
        }));
      } else {
        // Создаем новое занятие
        const newClassId = await classService.createClass({
          date: newClassDate,
          time: newClassTime,
          registeredChildren: []
        });
        
        // Добавляем новое занятие в state локально
        const newClass: ClassSession = {
          id: newClassId,
          date: newClassDate,
          time: newClassTime,
          registeredChildren: [],
          createdAt: new Date().toISOString()
        };
        
        setClasses(prevClasses => [newClass, ...prevClasses]);
      }

      setNewClassDate('');
      setNewClassTime('');
      setShowCreateClass(false);
      setEditingClassId(null);
    } catch (error) {
      console.error('Error saving class:', error);
      alert('Ошибка при сохранении занятия');
      // При ошибке перезагружаем данные
      loadData();
    } finally {
      setSavingClass(false);
    }
  };

  const handleEditClass = (classSession: ClassSession) => {
    setEditingClassId(classSession.id);
    setNewClassDate(classSession.date);
    setNewClassTime(classSession.time);
    setShowCreateClass(true);
    setViewMode('list'); // Переключаемся на список
  };

  const handleCancelEdit = () => {
    setEditingClassId(null);
    setNewClassDate('');
    setNewClassTime('');
    setShowCreateClass(false);
  };

  const handleDeleteClass = async (classId: string) => {
    if (!window.confirm('Вы уверены, что хотите удалить это занятие? Все записи детей будут потеряны.')) {
      return;
    }

    try {
      await classService.deleteClass(classId);
      
      // Удаляем занятие из state локально
      setClasses(prevClasses => prevClasses.filter(cls => cls.id !== classId));
      
      alert('✅ Занятие удалено');
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('Ошибка при удалении занятия');
      // При ошибке перезагружаем данные
      loadData();
    }
  };

  const handleRegisterChild = async (e: React.FormEvent, classId: string) => {
    e.preventDefault();
    
    if (savingRegistration) return; // Защита от повторного клика
    if (!selectedChildId) return;

    try {
      setSavingRegistration(true);
      
      // Находим клиента и ребенка по ID ребенка
      let foundClient = null;
      let foundChild = null;
      
      for (const client of clients) {
        const child = client.children.find(ch => ch.id === selectedChildId);
        if (child) {
          foundClient = client;
          foundChild = child;
          break;
        }
      }
      
      if (!foundClient || !foundChild) {
        alert('Ребенок не найден');
        return;
      }

      await classService.registerChild(classId, foundClient.id, foundChild.id, foundChild.name);
      
      // Обновляем state локально без перезагрузки всех данных
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id === classId) {
          return {
            ...cls,
            registeredChildren: [
              ...cls.registeredChildren,
              {
                clientId: foundClient!.id,
                childId: foundChild!.id,
                childName: foundChild!.name,
                attended: false,
                paid: false
              }
            ]
          };
        }
        return cls;
      }));
      
      setSelectedChildId('');
      setShowRegisterChild(null);
    } catch (error) {
      console.error('Error registering child:', error);
      alert('Ошибка при записи ребенка');
      // При ошибке перезагружаем данные
      loadData();
    } finally {
      setSavingRegistration(false);
    }
  };

  const handleMarkAttendance = async (classId: string, clientId: string, childId: string) => {
    try {
      await classService.markAttendance(classId, clientId, childId);
      
      // Обновляем state локально без перезагрузки всех данных
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id === classId) {
          return {
            ...cls,
            registeredChildren: cls.registeredChildren.map(reg => {
              if (reg.clientId === clientId && reg.childId === childId) {
                return { ...reg, attended: true, paid: true };
              }
              return reg;
            })
          };
        }
        return cls;
      }));
      
      // Обновляем баланс клиента локально
      setClients(prevClients => prevClients.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            classesRemaining: Math.max(0, (client.classesRemaining ?? 0) - 1)
          };
        }
        return client;
      }));
    } catch (error: any) {
      console.error('Error marking attendance:', error);
      alert(error.message || 'Ошибка при отметке посещения');
      // При ошибке перезагружаем данные
      loadData();
    }
  };

  const handleCancelAttendance = async (classId: string, clientId: string, childId: string) => {
    if (!window.confirm('Отменить посещение и вернуть занятие на баланс?')) {
      return;
    }

    try {
      await classService.cancelAttendance(classId, clientId, childId);
      
      // Обновляем state локально
      setClasses(prevClasses => prevClasses.map(cls => {
        if (cls.id === classId) {
          return {
            ...cls,
            registeredChildren: cls.registeredChildren.map(reg => {
              if (reg.clientId === clientId && reg.childId === childId) {
                return { ...reg, attended: false, paid: false };
              }
              return reg;
            })
          };
        }
        return cls;
      }));
      
      // Возвращаем баланс клиента локально
      setClients(prevClients => prevClients.map(client => {
        if (client.id === clientId) {
          return {
            ...client,
            classesRemaining: (client.classesRemaining ?? 0) + 1
          };
        }
        return client;
      }));
    } catch (error: any) {
      console.error('Error canceling attendance:', error);
      alert(error.message || 'Ошибка при отмене посещения');
      // При ошибке перезагружаем данные
      loadData();
    }
  };

  // Получаем список всех детей со всех клиентов
  const getAllChildren = () => {
    const allChildren: Array<{ 
      id: string; 
      name: string; 
      age: number; 
      clientPhone: string; 
      clientId: string;
      parentNames: string;
    }> = [];
    
    clients.forEach(client => {
      const parentNames = client.parents.map(p => p.name).filter(n => n).join(', ') || 'Не указаны';
      
      client.children.forEach(child => {
        allChildren.push({
          id: child.id,
          name: child.name,
          age: child.age,
          clientPhone: client.phoneNumber,
          clientId: client.id,
          parentNames: parentNames
        });
      });
    });
    
    return allChildren.sort((a, b) => a.name.localeCompare(b.name));
  };

  const handleCalendarSelect = (start: Date) => {
    // Заполняем форму данными из выбранного слота календаря
    const dateStr = start.toISOString().split('T')[0];
    const timeStr = `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
    
    setNewClassDate(dateStr);
    setNewClassTime(timeStr);
    setShowCreateClass(true);
    setViewMode('list');
  };

  const handleEventSelect = (classSession: ClassSession) => {
    setViewMode('list');
    // Прокручиваем к выбранному занятию
    setTimeout(() => {
      const element = document.getElementById(`class-${classSession.id}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('ring-4', 'ring-blue-400');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-blue-400');
        }, 2000);
      }
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Занятия</h1>
          <div className="flex space-x-3">
            <div className="flex bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('calendar')}
                className={`px-4 py-2 rounded-md transition ${
                  viewMode === 'calendar' 
                    ? 'bg-white text-blue-600 shadow' 
                    : 'text-gray-600'
                }`}
              >
                📅 Календарь
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-4 py-2 rounded-md transition ${
                  viewMode === 'list' 
                    ? 'bg-white text-blue-600 shadow' 
                    : 'text-gray-600'
                }`}
              >
                📋 Список
              </button>
            </div>
            <button
              onClick={() => setShowCreateClass(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition"
            >
              + Создать занятие
            </button>
          </div>
        </div>

        {showCreateClass && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingClassId ? 'Редактировать занятие' : 'Новое занятие'}
            </h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={savingClass}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingClass ? 'Сохранение...' : editingClassId ? 'Сохранить' : 'Создать'}
                </button>
                <button
                  type="button"
                  disabled={savingClass}
                  onClick={handleCancelEdit}
                  className="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        )}

        {viewMode === 'calendar' ? (
          loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : (
            <ClassCalendar 
              classes={classes}
              onSelectSlot={handleCalendarSelect}
              onSelectEvent={handleEventSelect}
            />
          )
        ) : loading ? (
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
              <div key={classSession.id} id={`class-${classSession.id}`} className="bg-white rounded-lg shadow p-6 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      {format(new Date(classSession.date), 'dd MMMM yyyy', { locale: ru })}
                    </h3>
                    <p className="text-gray-600">Время: {classSession.time}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowRegisterChild(
                        showRegisterChild === classSession.id ? null : classSession.id
                      )}
                      className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
                    >
                      + Записать ребенка
                    </button>
                    <button
                      onClick={() => handleEditClass(classSession)}
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition"
                      title="Редактировать"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classSession.id)}
                      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
                      title="Удалить"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {showRegisterChild === classSession.id && (
                  <div className="border-t border-gray-200 pt-4 mb-4">
                    <form onSubmit={(e) => handleRegisterChild(e, classSession.id)} className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Выберите ребенка
                        </label>
                        <select
                          value={selectedChildId}
                          onChange={(e) => setSelectedChildId(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Выберите ребенка из списка</option>
                          {getAllChildren().map(child => (
                            <option key={child.id} value={child.id}>
                              {child.name} ({child.age} лет) - Родители: {child.parentNames} - Тел: +998{child.clientPhone}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={savingRegistration}
                          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {savingRegistration ? 'Запись...' : 'Записать'}
                        </button>
                        <button
                          type="button"
                          disabled={savingRegistration}
                          onClick={() => {
                            setShowRegisterChild(null);
                            setSelectedChildId('');
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
                          
                          {!registration.attended ? (
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
                          ) : (
                            <button
                              onClick={() => handleCancelAttendance(
                                classSession.id,
                                registration.clientId,
                                registration.childId
                              )}
                              className="bg-orange-600 hover:bg-orange-700 text-white py-1 px-4 rounded-md text-sm transition"
                            >
                              ↩️ Отменить
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

