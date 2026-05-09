import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import { renderWithRouter } from '../../test/renderWithRouter';
import { RequestsDashboard } from './RequestsDashboard';

describe('RequestsDashboard', () => {
  it('loads requests and filters them by status', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RequestsDashboard />, ['/requests']);

    await waitForElementToBeRemoved(() => screen.queryByText('Загрузка заявок...'));
    expect(screen.getByRole('heading', { name: 'Как этот проект демонстрирует frontend-тестирование' })).toBeInTheDocument();
    expect(screen.getByText('Mock API')).toBeInTheDocument();
    expect(screen.getByText('Unit tests')).toBeInTheDocument();
    expect(screen.getByText('Integration tests')).toBeInTheDocument();
    expect(screen.getByText('E2E tests')).toBeInTheDocument();
    expect(screen.getByText('npm run test:unit')).toBeInTheDocument();
    expect(screen.getByText('src/**/*.integration.test.tsx')).toBeInTheDocument();
    expect(screen.getByText('tests/e2e/app.spec.ts')).toBeInTheDocument();
    expect(screen.getByText('Всего: 3')).toBeInTheDocument();
    expect(screen.getByText('Payment gateway timeout')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Статус'), 'closed');

    expect(screen.getByText('Показано 1 из 3; сортировка: высокий приоритет и новые выше.')).toBeInTheDocument();
    expect(screen.getByText('Onboarding checklist update')).toBeInTheDocument();
    expect(screen.queryByText('Payment gateway timeout')).not.toBeInTheDocument();
  });

  it('shows empty state for filters without matches', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RequestsDashboard />, ['/requests']);

    await waitForElementToBeRemoved(() => screen.queryByText('Загрузка заявок...'));
    await user.type(screen.getByLabelText('Поиск'), 'unmatched query');

    expect(screen.getByRole('heading', { name: 'Заявок не найдено' })).toBeInTheDocument();
  });

  it('shows API error state and recovers after retry', async () => {
    const user = userEvent.setup();
    renderWithRouter(<RequestsDashboard />, ['/requests']);

    await waitForElementToBeRemoved(() => screen.queryByText('Загрузка заявок...'));
    await user.click(screen.getByRole('button', { name: 'Сымитировать ошибку API' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Сервис заявок временно недоступен');

    await user.click(screen.getByRole('button', { name: 'Повторить' }));

    expect(await screen.findByText('Payment gateway timeout')).toBeInTheDocument();
  });
});
