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

### Unit

- `loginSchema` и `requestSchema` проверяют валидные и невалидные payload.
- `requestUtils` проверяет фильтрацию по статусу, поиск и сортировку по приоритету.

### Integration

- `LoginPage`: client validation, loading/success flow, server error.
- `CreateRequestPage`: validation, успешный submit, API error.
- `RequestsDashboard`: загрузка списка, фильтр, empty state, error state и retry.

### E2E

Playwright покрывает основной пользовательский сценарий:

1. пользователь логинится;
2. открывает dashboard;
3. создает заявку;
4. видит новую заявку в списке.

## Почему MSW

MSW перехватывает реальные `fetch`-запросы на уровне network boundary. Компоненты работают с тем же API-клиентом, что и в настоящем приложении, а тесты остаются быстрыми и детерминированными. Один набор handlers используется в браузере, integration tests и e2e.

## Что можно улучшить

- Добавить авторизационный guard для приватных страниц.
- Добавить server-side фильтрацию и пагинацию.
- Подключить визуальные regression tests.
- Расширить error scenarios через query-параметры или test-only controls.
- Добавить accessibility checks в Playwright.
