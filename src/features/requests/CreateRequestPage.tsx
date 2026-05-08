import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { FieldError } from '../../components/FieldError';
import { createRequest } from '../../services/api';
import { requestSchema, type RequestFormValues } from './requestSchema';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

export function CreateRequestPage() {
  const navigate = useNavigate();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitState('loading');
    setApiError('');

    try {
      await createRequest(values);
      setSubmitState('success');
      navigate('/requests', {
        state: {
          flash: 'Заявка создана',
        },
      });
    } catch (error) {
      setSubmitState('error');
      setApiError(error instanceof Error ? error.message : 'Не удалось создать заявку');
    }
  });

  return (
    <main className="page-shell">
      <header className="page-header">
        <div>
          <p className="eyebrow">Новая заявка</p>
          <h1>Создать заявку</h1>
        </div>
        <Link className="button button--secondary" to="/requests">
          К списку
        </Link>
      </header>

      <section className="panel form-panel" aria-labelledby="request-form-title">
        <h2 id="request-form-title">Детали обращения</h2>
        <form className="form" onSubmit={onSubmit} noValidate>
          <div className="field">
            <label htmlFor="title">Название</label>
            <input
              id="title"
              type="text"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
              {...register('title')}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </div>

          <div className="field">
            <label htmlFor="description">Описание</label>
            <textarea
              id="description"
              rows={5}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={errors.description ? 'description-error' : undefined}
              {...register('description')}
            />
            <FieldError id="description-error" message={errors.description?.message} />
          </div>

          <div className="field">
            <label htmlFor="priority">Приоритет</label>
            <select id="priority" aria-invalid={Boolean(errors.priority)} {...register('priority')}>
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Высокий</option>
            </select>
            <FieldError id="priority-error" message={errors.priority?.message} />
          </div>

          {apiError ? (
            <div className="alert alert--error" role="alert">
              {apiError}
            </div>
          ) : null}

          {submitState === 'success' ? (
            <div className="alert alert--success" role="status">
              Заявка создана
            </div>
          ) : null}

          <button className="button button--primary" type="submit" disabled={submitState === 'loading'}>
            {submitState === 'loading' ? 'Создаем...' : 'Создать'}
          </button>
        </form>
      </section>
    </main>
  );
}
