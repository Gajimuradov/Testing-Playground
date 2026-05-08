import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { StatusBadge } from '../../components/StatusBadge';
import { getRequests } from '../../services/api';
import { filterRequests, sortRequestsByPriority } from './requestUtils';
import type { RequestStatus, SupportRequest } from './types';

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

export function RequestsDashboard() {
  const location = useLocation();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [status, setStatus] = useState<RequestStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [loadState, setLoadState] = useState<LoadState>('idle');
  const [error, setError] = useState('');
  const [forceError, setForceError] = useState(false);
  const flash = (location.state as LocationState | null)?.flash;

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

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Requests dashboard</p>
          <h1>Заявки</h1>
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
          {forceError ? 'Показать список' : 'Показать ошибку API'}
        </button>
      </section>

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
        <section className="request-list" aria-label="Список заявок">
          {visibleRequests.map((request) => (
            <article className="panel request-card" key={request.id}>
              <div className="request-card__header">
                <div>
                  <h2>{request.title}</h2>
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
              </dl>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
