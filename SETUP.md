# Пошаговая настройка CashFlow CRM

## 📦 Шаг 1: Установка зависимостей

\`\`\`bash
npm install
\`\`\`

## 🔥 Шаг 2: Настройка Firebase

### 2.1. Создание проекта Firebase

1. Перейдите на [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Add project" (Добавить проект)
3. Введите название: `cashflow-crm` (или любое другое)
4. Отключите Google Analytics (не обязателен для этого проекта)
5. Нажмите "Create project"

### 2.2. Настройка Firestore Database

1. В меню слева выберите **Build** → **Firestore Database**
2. Нажмите "Create database"
3. Выберите "Start in **test mode**" (для разработки) или "production mode" (для продакшена)
4. Выберите регион (рекомендую `asia-south1` для Узбекистана)
5. Нажмите "Enable"

### 2.3. Настройка Authentication

1. В меню слева выберите **Build** → **Authentication**
2. Нажмите "Get started"
3. Выберите **Email/Password**
4. Включите первый переключатель (Email/Password)
5. Нажмите "Save"

### 2.4. Получение конфигурации Firebase

1. В меню слева нажмите на иконку шестеренки → **Project settings**
2. Прокрутите вниз до раздела "Your apps"
3. Нажмите на иконку **</>** (Web)
4. Введите название приложения: `cashflow-web`
5. **НЕ** включайте Firebase Hosting (пока)
6. Нажмите "Register app"
7. Скопируйте значения из `firebaseConfig`

### 2.5. Настройка конфигурации в проекте

Откройте файл `src/firebase/config.ts` и замените значения:

\`\`\`typescript
const firebaseConfig = {
  apiKey: "ваш_API_KEY",
  authDomain: "ваш_AUTH_DOMAIN",
  projectId: "ваш_PROJECT_ID",
  storageBucket: "ваш_STORAGE_BUCKET",
  messagingSenderId: "ваш_MESSAGING_SENDER_ID",
  appId: "ваш_APP_ID"
};
\`\`\`

## 👤 Шаг 3: Создание первого пользователя

1. В Firebase Console → **Authentication** → **Users**
2. Нажмите "Add user"
3. Email: введите телефон в формате `<номер>@cashflow.uz`
   - Например: `901234567@cashflow.uz`
4. Password: введите пароль (минимум 6 символов)
5. Нажмите "Add user"

**Важно!** Email должен быть в формате `<9цифр>@cashflow.uz`, где 9 цифр - это номер телефона без +998.

## 🔒 Шаг 4: Настройка правил безопасности Firestore

1. В Firebase Console → **Firestore Database** → **Rules**
2. Замените содержимое на:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Требуется авторизация для всех операций
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

3. Нажмите "Publish"

## 🚀 Шаг 5: Запуск приложения

\`\`\`bash
npm run dev
\`\`\`

Приложение откроется на `http://localhost:5173`

## 🔐 Шаг 6: Вход в систему

1. Откройте приложение в браузере
2. Введите логин (9 цифр телефона): `901234567`
3. Введите пароль, который вы создали в Firebase
4. Нажмите "Войти"

## ✅ Проверка работы

После входа вы должны увидеть главную страницу со списком клиентов (пока пустым).

Попробуйте:
1. Добавить клиента
2. Пополнить баланс
3. Создать занятие
4. Записать ребенка на занятие

## 🐛 Решение проблем

### Ошибка при входе "Неверный логин или пароль"

- Убедитесь, что пользователь создан в Firebase Authentication
- Проверьте формат email: `<9цифр>@cashflow.uz`
- Проверьте, что вы вводите правильный пароль

### Ошибка "Firebase: Error (auth/configuration-not-found)"

- Проверьте, что вы правильно скопировали конфигурацию Firebase
- Убедитесь, что Authentication включен в Firebase Console

### Ошибка при добавлении клиента

- Проверьте правила безопасности Firestore
- Убедитесь, что вы авторизованы

### Приложение не запускается

\`\`\`bash
# Удалите node_modules и установите заново
rm -rf node_modules
npm install
npm run dev
\`\`\`

## 📤 Деплой (опционально)

### Вариант 1: Firebase Hosting

\`\`\`bash
# Установите Firebase CLI
npm install -g firebase-tools

# Войдите в Firebase
firebase login

# Инициализируйте проект
firebase init hosting

# Соберите проект
npm run build

# Задеплойте
firebase deploy
\`\`\`

### Вариант 2: Vercel

1. Установите Vercel CLI: \`npm i -g vercel\`
2. Запустите: \`vercel\`
3. Следуйте инструкциям

### Вариант 3: Netlify

1. Перейдите на [netlify.com](https://netlify.com)
2. Подключите GitHub репозиторий
3. Build command: \`npm run build\`
4. Publish directory: \`dist\`

## 🎉 Готово!

Теперь ваша CRM система готова к использованию!

