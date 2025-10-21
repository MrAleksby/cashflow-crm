import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { fixAllClientsBalance } from '../utils/fixClientsBalance';

const AdminPage: React.FC = () => {
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<{ fixed: number; errors: number; total: number } | null>(null);

  const handleFixBalance = async () => {
    if (!window.confirm('Вы уверены? Это пересчитает баланс занятий для всех клиентов на основе истории транзакций.')) {
      return;
    }

    try {
      setFixing(true);
      setResult(null);
      const res = await fixAllClientsBalance();
      setResult(res);
      alert('✅ Исправление завершено! Проверьте консоль для деталей.');
    } catch (error) {
      console.error('Ошибка:', error);
      alert('❌ Произошла ошибка при исправлении');
    } finally {
      setFixing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔧 Администрирование</h1>

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Исправление баланса занятий</h2>
            <p className="text-gray-600 mb-4">
              Эта утилита пересчитает количество доступных занятий для всех клиентов на основе истории транзакций.
              Используйте если у клиентов отображается некорректное количество занятий.
            </p>
            
            {result && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="font-semibold text-blue-900 mb-2">📊 Результаты:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>✅ Исправлено клиентов: {result.fixed}</li>
                  <li>❌ Ошибок: {result.errors}</li>
                  <li>📋 Всего обработано: {result.total}</li>
                </ul>
              </div>
            )}

            <button
              onClick={handleFixBalance}
              disabled={fixing}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fixing ? '⏳ Исправление...' : '🔧 Исправить баланс всех клиентов'}
            </button>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">ℹ️ Информация</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Утилита безопасна - она только пересчитывает баланс, не удаляет данные</p>
              <p>• Процесс может занять несколько секунд в зависимости от количества клиентов</p>
              <p>• После исправления обновите страницы клиентов</p>
              <p>• Все действия логируются в консоль браузера (F12)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

