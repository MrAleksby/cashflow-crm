# 🚀 Загрузка на GitHub

## Шаг 1: Настройте Git (если еще не настроено)

```bash
git config --global user.name "Ваше Имя"
git config --global user.email "ваш@email.com"
```

## Шаг 2: Создайте репозиторий на GitHub

1. Перейдите на [github.com](https://github.com)
2. Войдите в свой аккаунт (или создайте новый)
3. Нажмите на "+" в правом верхнем углу → "New repository"
4. Заполните:
   - **Repository name**: `cashflow-crm` (или любое другое название)
   - **Description**: "CRM система для управления клиентами детских занятий"
   - **Visibility**: Public или Private (на ваш выбор)
   - ⚠️ **НЕ** ставьте галочки на "Add README" или ".gitignore" (у нас уже есть)
5. Нажмите "Create repository"

## Шаг 3: Подключите локальный репозиторий к GitHub

После создания репозитория на GitHub, скопируйте URL (он будет выглядеть как `https://github.com/username/cashflow-crm.git`)

Затем выполните команды:

```bash
# Сделайте коммит (если еще не сделали)
git commit -m "Initial commit: CashFlow CRM v1.0"

# Переименуйте ветку в main (если нужно)
git branch -M main

# Подключите remote репозиторий (замените YOUR_USERNAME и REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Загрузите код на GitHub
git push -u origin main
```

## Шаг 4: Проверьте

Обновите страницу вашего репозитория на GitHub - вы должны увидеть все файлы!

## 🔒 Важно!

### Перед загрузкой убедитесь:

1. ✅ `.gitignore` правильно настроен (уже готов)
2. ⚠️ **НЕ** загружайте файл `.env` с реальными ключами Firebase
3. ✅ В `src/firebase/config.ts` используйте placeholder'ы или environment variables

### Безопасность Firebase

**Вариант 1: Использовать environment variables (рекомендуется)**

Замените в `src/firebase/config.ts`:
```typescript
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};
```

Создайте `.env.local` (он уже в .gitignore):
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
...и так далее
```

**Вариант 2: Оставить как есть**

Если оставите реальные ключи в коде - сделайте репозиторий **Private** на GitHub.

## 📤 Команды для работы с GitHub

```bash
# Проверить статус
git status

# Добавить изменения
git add .

# Сделать коммит
git commit -m "Описание изменений"

# Загрузить на GitHub
git push

# Скачать изменения
git pull

# Посмотреть remote репозитории
git remote -v
```

## 🌐 Деплой сайта

После загрузки на GitHub можете задеплоить на:

### Vercel (рекомендуется - бесплатно)
1. Зайдите на [vercel.com](https://vercel.com)
2. Нажмите "Import Project"
3. Выберите ваш GitHub репозиторий
4. Добавьте environment variables (VITE_FIREBASE_*)
5. Deploy!

### Netlify
1. Зайдите на [netlify.com](https://netlify.com)
2. "Add new site" → "Import from Git"
3. Выберите репозиторий
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Добавьте environment variables
7. Deploy!

### Firebase Hosting
```bash
firebase login
firebase init hosting
npm run build
firebase deploy
```

## ✅ Готово!

Ваш проект теперь на GitHub! 🎉

---

**Не забудьте:**
- ⭐ Поставить звезду своему репозиторию
- 📝 Обновить README.md с вашими деталями
- 🔒 Настроить правила Firestore в продакшене
- 💾 Регулярно делать бэкапы данных

