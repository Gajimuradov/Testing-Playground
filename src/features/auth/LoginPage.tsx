import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { FieldError } from '../../components/FieldError';
import { login } from '../../services/api';
import { loginSchema, type LoginFormValues } from './loginSchema';

type SubmitState = 'idle' | 'loading' | 'success' | 'error';

const successDelayMs = 250;

export function LoginPage() {
  const navigate = useNavigate();
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [apiError, setApiError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitState('loading');
    setApiError('');

    try {
      const result = await login(values);
      localStorage.setItem('testing-playground-token', result.token);
      setSubmitState('success');
      await new Promise((resolve) => window.setTimeout(resolve, successDelayMs));
      navigate('/requests');
    } catch (error) {
      setSubmitState('error');
      setApiError(error instanceof Error ? error.message : 'Не удалось войти');
    }
  });

  return (
    <main className="auth-layout">
      <section className="panel auth-panel" aria-labelledby="login-title">
        <div className="auth-copy">
          <p className="eyebrow">Testing Playground</p>
          <h1 id="login-title">Демо frontend-тестирования</h1>
          <p>
            Вход запускает основной пользовательский путь: dashboard, mock API, формы, состояния загрузки и ошибки. Этот экран
            намеренно простой, чтобы тесты проверяли поведение, а не декоративную оболочку.
          </p>

          <dl className="demo-credentials" aria-label="Демо-доступ">
            <div>
              <dt>Email</dt>
              <dd>user@example.com</dd>
            </div>
            <div>
              <dt>Пароль</dt>
              <dd>password123</dd>
            </div>
            <div>
              <dt>Error case</dt>
              <dd>error@example.com</dd>
            </div>
          </dl>
        </div>

        <div className="auth-form-card">
          <h2>Вход в демо-кабинет</h2>
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
              <FieldError id="email-error" message={errors.email?.message} />
            </div>

            <div className="field">
              <label htmlFor="password">Пароль</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
              <FieldError id="password-error" message={errors.password?.message} />
            </div>

            {apiError ? (
              <div className="alert alert--error" role="alert">
                {apiError}
              </div>
            ) : null}

            {submitState === 'success' ? (
              <div className="alert alert--success" role="status">
                Вход выполнен
              </div>
            ) : null}

            <button className="button button--primary" type="submit" disabled={submitState === 'loading'}>
              {submitState === 'loading' ? 'Входим...' : 'Войти'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
