# Testing Playground

Небольшой React + TypeScript pet-проект, который показывает три уровня frontend-тестирования: unit, integration и e2e. В приложении есть логин, список заявок с фильтрами и поиском, форма создания заявки и mock API на MSW.

## Стек

- React + TypeScript + Vite
- React Router
- React Hook Form + Zod
- MSW для mock API
- Vitest + React Testing Library
- Playwright

## Функциональность

- Login page: email/password, валидация, loading/error/success states.
- Requests dashboard: список заявок, фильтр по статусу, поиск, empty state, error state.
- Create request form: title, description, priority, валидация, submit через mock API.
- Mock API:
  - `POST /login`
  - `GET /requests`
  - `POST /requests`
  - success/error сценарии для форм и дашборда.

## Запуск

```bash
npm install
npm run dev
```

После установки MSW создаст service worker в `public/mockServiceWorker.js`. В dev-режиме приложение стартует mock API автоматически.

## Тесты

```bash
npm test
npm run test:unit
npm run test:integration
npm run test:e2e
npm run build
```
