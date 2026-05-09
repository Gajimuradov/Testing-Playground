import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { getRequests } from '../../services/api';
import { filterRequests, sortRequestsByPriority } from './requestUtils';
import type { RequestPriority, RequestStatus, SupportRequest } from './types';

type LoadState = 'idle' | 'loading' | 'success' | 'error';

type LocationState = {
  flash?: string;
};

const statusOptions: Array<{ value: RequestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Все статусы' },
  { value: 'open', label: 'Открыта' },
  { value: 'in-progress', label: 'В работе' },
  { value: 'closed', label: 'Закрыта' },
];

const priorityLabels: Record<SupportRequest['priority'], string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

const testLevels = [
  {
    title: 'Unit tests',
    target: 'Чистые правила без UI',
    description:
      'Показывают, что бизнес-логика проверяется отдельно от React: схемы валидации принимают корректные данные и отклоняют ошибки, а утилиты фильтруют и сортируют заявки предсказуемо.',
    checks: ['loginSchema и requestSchema', 'filterRequests', 'sortRequestsByPriority'],
    command: 'npm run test:unit',
    files: 'src/**/*.unit.test.ts',
  },
  {
    title: 'Integration tests',
    target: 'Компоненты вместе с API',
    description:
      'Показывают, как пользователь взаимодействует с формами и dashboard: вводит данные, видит validation errors, loading, success, empty и server error. Сеть при этом мокается через MSW.',
    checks: ['LoginPage', 'CreateRequestPage', 'RequestsDashboard'],
    command: 'npm run test:integration',
    files: 'src/**/*.integration.test.tsx',
  },
  {
    title: 'E2E tests',
    target: 'Полный путь в браузере',
    description:
      'Показывают, что приложение работает как единый продукт: пользователь входит, открывает dashboard, создает заявку, перезагружает страницу и снова видит созданную заявку без старого flash-сообщения.',
    checks: ['login', 'create request', 'reload persistence'],
    command: 'npm run test:e2e',
    files: 'tests/e2e/app.spec.ts',
  },
];

function formatRelativeAge(date: string) {
  const createdAt = new Date(date).getTime();
  const now = Date.now();
  const days = Math.max(0, Math.floor((now - createdAt) / 86_400_000));

  if (days === 0) {
    return 'сегодня';
  }

  if (days === 1) {
    return '1 день назад';
  }

  if (days > 1 && days < 5) {
    return `${days} дня назад`;
  }

  return `${days} дней назад`;
}

export function RequestsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState('');
  const [forceError, setForceError] = useState(false);
  const [flash, setFlash] = useState(() => (location.state as LocationState | null)?.flash ?? '');

  useEffect(() => {
    const routeFlash = (location.state as LocationState | null)?.flash;

    if (!routeFlash) {
      return;
    }

    setFlash(routeFlash);
    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    if (!flash) {
      return;
    }

    const timer = window.setTimeout(() => {
      setFlash('');
    }, 3_000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [flash]);

  useEffect(() => {
    let ignore = false;

    async function loadRequests() {
      setLoadState('loading');
      setError('');

      try {
        const data = await getRequests({ shouldFail: forceError });

        if (!ignore) {
          setRequests(data);
          setLoadState('success');
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'Не удалось загрузить заявки');
          setLoadState('error');
        }
      }
    }

    loadRequests();

    return () => {
      ignore = true;
    };
  }, [forceError]);

  const visibleRequests = useMemo(() => {
    return sortRequestsByPriority(filterRequests(requests, { status, query }));
  }, [query, requests, status]);

  const dashboardStats = useMemo(() => {
    const statusCounts: Record<RequestStatus, number> = {
      open: 0,
      'in-progress': 0,
      closed: 0,
    };
    const priorityCounts: Record<RequestPriority, number> = {
      high: 0,
      medium: 0,
      low: 0,
    };

    for (const request of requests) {
      statusCounts[request.status] += 1;
      priorityCounts[request.priority] += 1;
    }

    return {
      total: requests.length,
      visible: visibleRequests.length,
      statusCounts,
      priorityCounts,
    };
  }, [requests, visibleRequests.length]);

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Frontend testing demo</p>
          <h1>Заявки</h1>
          <p>
            Один рабочий сценарий показывает разные уровни тестирования: от чистых функций до полного browser journey.
          </p>
        </div>
        <Link className="button button--primary" to="/requests/new">
          Создать заявку
        </Link>
      </header>

      {flash ? (
        <div className="alert alert--success" role="status">
          {flash}
        </div>
      ) : null}

      <section className="toolbar" aria-label="Фильтры заявок">
        <div className="field field--inline">
          <label htmlFor="status">Статус</label>
          <select id="status" value={status} onChange={(event) => setStatus(event.target.value as RequestStatus | 'all')}>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field field--inline search-field">
          <label htmlFor="search">Поиск</label>
          <input
            id="search"
            type="search"
            placeholder="Название или описание"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <button className="button button--secondary" type="button" onClick={() => setForceError((value) => !value)}>
          {forceError ? 'Вернуть список' : 'Сымитировать ошибку API'}
        </button>
      </section>

      {loadState === 'success' ? (
        <section className="testing-guide" aria-labelledby="testing-guide-title">
          <div className="testing-guide__intro">
            <div>
              <p className="eyebrow">Testing playground</p>
              <h2 id="testing-guide-title">Как этот проект демонстрирует frontend-тестирование</h2>
              <p>
                Это не полноценная helpdesk-система. Заявки здесь нужны как понятный пользовательский сценарий, на котором видно,
                где заканчиваются unit-тесты, где начинаются integration-тесты и что имеет смысл проверять через настоящий браузер.
              </p>
            </div>

            <dl className="testing-facts" aria-label="Сводка demo-состояния">
              <div>
                <dt>Mock API</dt>
                <dd>MSW handlers: login, list, create, error</dd>
              </div>
              <div>
                <dt>UI states</dt>
                <dd>loading, validation, success, empty, error</dd>
              </div>
              <div>
                <dt>Reload case</dt>
                <dd>созданная заявка сохраняется в mock storage</dd>
              </div>
            </dl>
          </div>

          <div className="testing-levels">
            {testLevels.map((level) => (
              <article className="testing-level" key={level.title}>
                <div className="testing-level__header">
                  <strong>{level.title}</strong>
                  <span>{level.target}</span>
                </div>
                <p>{level.description}</p>
                <ul>
                  {level.checks.map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
                <div className="testing-level__meta">
                  <code>{level.command}</code>
                  <code>{level.files}</code>
                </div>
              </article>
            ))}
          </div>

          <div className="coverage-strip" aria-label="Что сейчас видно на dashboard">
            <span>Всего: {dashboardStats.total}</span>
            <span>Показано: {dashboardStats.visible}</span>
            <span>Открытые: {dashboardStats.statusCounts.open}</span>
            <span>В работе: {dashboardStats.statusCounts['in-progress']}</span>
            <span>Высокий приоритет: {dashboardStats.priorityCounts.high}</span>
          </div>
        </section>
      ) : null}

      {loadState === 'loading' ? (
        <section className="panel state-panel" aria-live="polite">
          Загрузка заявок...
        </section>
      ) : null}

      {loadState === 'error' ? (
        <section className="panel state-panel state-panel--error" role="alert">
          <h2>Не удалось загрузить заявки</h2>
          <p>{error}</p>
          <button className="button button--secondary" type="button" onClick={() => setForceError(false)}>
            Повторить
          </button>
        </section>
      ) : null}

      {loadState === 'success' && visibleRequests.length === 0 ? (
        <section className="panel state-panel">
          <h2>Заявок не найдено</h2>
          <p>Измените фильтр или поисковый запрос.</p>
        </section>
      ) : null}

      {loadState === 'success' && visibleRequests.length > 0 ? (
        <section aria-label="Список заявок">
          <div className="list-heading">
            <div>
              <h2>Очередь заявок</h2>
              <p>
                Показано {visibleRequests.length} из {requests.length}; сортировка: высокий приоритет и новые выше.
              </p>
            </div>
          </div>

          <div className="request-list">
            {visibleRequests.map((request) => (
              <article className="panel request-card" key={request.id}>
                <div className="request-card__header">
                  <div>
                    <h3>{request.title}</h3>
                    <p>{request.description}</p>
                  </div>
                  <StatusBadge status={request.status} />
                </div>
                <dl className="request-meta">
                  <div>
                    <dt>Приоритет</dt>
                    <dd>{priorityLabels[request.priority]}</dd>
                  </div>
                  <div>
                    <dt>Создана</dt>
                    <dd>{new Intl.DateTimeFormat('ru-RU').format(new Date(request.createdAt))}</dd>
                  </div>
                  <div>
                    <dt>Возраст</dt>
                    <dd>{formatRelativeAge(request.createdAt)}</dd>
                  </div>
                </dl>
                <div className="request-card__footer">
                  <span>{request.status === 'open' ? 'Ожидает первого действия' : 'Есть процесс обработки'}</span>
                  <span>{request.priority === 'high' ? 'Контроль SLA' : 'Обычный контроль'}</span>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
