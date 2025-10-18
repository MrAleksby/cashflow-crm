# 🚀 Быстрый старт CashFlow CRM

## За 5 минут до запуска!

### 1️⃣ Установите зависимости
\`\`\`bash
npm install
\`\`\`

### 2️⃣ Настройте Firebase

1. Создайте проект на [firebase.google.com](https://console.firebase.google.com/)
2. Включите **Firestore Database** и **Authentication (Email/Password)**
3. Скопируйте конфигурацию из Project Settings
4. Откройте `src/firebase/config.ts` и вставьте свои данные

### 3️⃣ Создайте пользователя

В Firebase Console → Authentication → Users → Add User:
- Email: `901234567@cashflow.uz` (ваш телефон + @cashflow.uz)
- Password: любой пароль (минимум 6 символов)

### 4️⃣ Запустите
\`\`\`bash
npm run dev
\`\`\`

### 5️⃣ Войдите
- Логин: `901234567` (9 цифр телефона)
- Пароль: тот что создали в Firebase

## 🎉 Готово!

Подробные инструкции в файле [SETUP.md](./SETUP.md)

