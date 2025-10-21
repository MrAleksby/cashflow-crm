// Утилита для исправления баланса занятий клиентов на основе истории транзакций
import { clientService } from '../services/clientService';
import { transactionService } from '../services/transactionService';

export async function fixAllClientsBalance() {
  try {
    console.log('🔄 Начинаем исправление баланса клиентов...');
    
    // Получаем всех клиентов
    const clients = await clientService.getAllClients();
    console.log(`📋 Найдено клиентов: ${clients.length}`);
    
    let fixed = 0;
    let errors = 0;
    
    for (const client of clients) {
      try {
        // Получаем транзакции клиента
        const transactions = await transactionService.getClientTransactions(client.id);
        
        // Подсчитываем правильный баланс
        let correctBalance = 0;
        
        for (const transaction of transactions) {
          if (transaction.type === 'income' && transaction.classesCount) {
            // Покупка занятий - прибавляем
            correctBalance += transaction.classesCount;
          } else if (transaction.type === 'expense') {
            // Посещение занятия - вычитаем 1
            correctBalance -= 1;
          }
        }
        
        // Обновляем только если баланс отличается
        if (client.classesRemaining !== correctBalance) {
          console.log(`🔧 Клиент ${client.phoneNumber}: было ${client.classesRemaining}, должно быть ${correctBalance}`);
          await clientService.updateClassesRemaining(client.id, correctBalance);
          fixed++;
        }
      } catch (error) {
        console.error(`❌ Ошибка при обработке клиента ${client.phoneNumber}:`, error);
        errors++;
      }
    }
    
    console.log('✅ Исправление завершено!');
    console.log(`📊 Исправлено: ${fixed}, Ошибок: ${errors}, Всего: ${clients.length}`);
    
    return { fixed, errors, total: clients.length };
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    throw error;
  }
}

// Функция для исправления конкретного клиента
export async function fixClientBalance(clientId: string) {
  try {
    const client = await clientService.getClientById(clientId);
    if (!client) {
      throw new Error('Клиент не найден');
    }
    
    const transactions = await transactionService.getClientTransactions(clientId);
    
    let correctBalance = 0;
    
    for (const transaction of transactions) {
      if (transaction.type === 'income' && transaction.classesCount) {
        correctBalance += transaction.classesCount;
      } else if (transaction.type === 'expense') {
        correctBalance -= 1;
      }
    }
    
    console.log(`Клиент ${client.phoneNumber}: было ${client.classesRemaining}, должно быть ${correctBalance}`);
    
    await clientService.updateClassesRemaining(clientId, correctBalance);
    
    console.log('✅ Баланс исправлен!');
    return { old: client.classesRemaining, new: correctBalance };
  } catch (error) {
    console.error('Ошибка:', error);
    throw error;
  }
}

