# Testing Playground

React + TypeScript pet-проект для демонстрации frontend-тестирования на одном понятном пользовательском сценарии: пользователь входит в демо-кабинет, смотрит список заявок, фильтрует его, создает новую заявку и проверяет, что она остается после перезагрузки.

Проект намеренно не пытается быть полноценной helpdesk-системой. Его цель — показать, какие проверки стоит держать на уровне unit, какие на уровне component/integration, а какие оправданно запускать в браузере через Playwright.

## Быстрый старт

```bash
npm install
npm run dev
```

Демо-доступ:

- Email: `user@example.com`
- Пароль: `password123`
- Error case: `error@example.com`

## Что демонстрирует интерфейс

- Login page показывает form validation, loading, success и server error.
- Requests dashboard показывает фильтрацию, поиск, empty state, API error state и учебную карту тестирования.
- Create request form показывает Zod-валидацию, `POST /requests`, server error и redirect с flash-сообщением.
- Созданные заявки сохраняются в mock storage, поэтому e2e-сценарий проверяет reload persistence.

## Тестовая пирамида

| Уровень | Что проверяется | Команда |
| --- | --- | --- |
| Unit | Zod-схемы, фильтрация и сортировка без React | `npm run test:unit` |
| Integration | Login form, create form, dashboard states через React Testing Library + MSW | `npm run test:integration` |
| E2E | Полный путь пользователя в браузере: login, dashboard, create request, reload | `npm run test:e2e` |

Общий прогон:

```bash
npm test
npm run build
```

## Почему MSW

MSW перехватывает настоящие `fetch`-запросы на границе сети. Компоненты не знают, что API замокан, поэтому тесты остаются близкими к реальному поведению приложения:

- integration-тесты используют тот же API-клиент, что и UI;
- Playwright e2e работает с dev-приложением и теми же handlers;
- success/error сценарии задаются в одном месте — `src/mocks/handlers.ts`.

## Ключевые файлы

- `src/features/auth/LoginPage.tsx` — логин и состояния авторизации.
- `src/features/requests/RequestsDashboard.tsx` — dashboard, фильтры, empty/error states и объяснение тестовой стратегии.
- `src/features/requests/CreateRequestPage.tsx` — форма создания заявки.
- `src/mocks/handlers.ts` — mock API: `POST /login`, `GET /requests`, `POST /requests`.
- `src/test/setup.ts` — MSW setup для Vitest.
- `tests/e2e/app.spec.ts` — основной browser journey.
- `PROJECT_NOTES.local.md` — локальные заметки по UX-решениям и сценариям проверки.

## Что можно улучшить дальше

- Добавить guard для приватных маршрутов.
- Разнести MSW scenarios по named fixtures.
- Добавить accessibility checks в Playwright.
- Покрыть визуальные регрессии dashboard и форм.
- Добавить reset-кнопку для mock storage в dev-режиме.
