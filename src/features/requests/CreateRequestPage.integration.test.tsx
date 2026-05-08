import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { renderWithRouter } from '../../test/renderWithRouter';
import { CreateRequestPage } from './CreateRequestPage';

function renderCreateRequestPage() {
  renderWithRouter(
    <Routes>
      <Route path="/requests/new" element={<CreateRequestPage />} />
      <Route path="/requests" element={<h1>Заявки</h1>} />
    </Routes>,
    ['/requests/new'],
  );
}

describe('CreateRequestPage', () => {
  it('validates required request fields', async () => {
    const user = userEvent.setup();
    renderCreateRequestPage();

    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(await screen.findByText('Название должно быть не короче 3 символов')).toBeInTheDocument();
    expect(screen.getByText('Описание должно быть не короче 10 символов')).toBeInTheDocument();
  });

  it('submits a request through the mock API', async () => {
    const user = userEvent.setup();
    renderCreateRequestPage();

    await user.type(screen.getByLabelText('Название'), 'Broken invoice export');
    await user.type(screen.getByLabelText('Описание'), 'Invoice export fails for finance users.');
    await user.selectOptions(screen.getByLabelText('Приоритет'), 'high');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(await screen.findByRole('heading', { name: 'Заявки' })).toBeInTheDocument();
  });

  it('shows server error when API rejects creation', async () => {
    const user = userEvent.setup();
    renderCreateRequestPage();

    await user.type(screen.getByLabelText('Название'), 'Fail request');
    await user.type(screen.getByLabelText('Описание'), 'This payload should trigger API failure.');
    await user.selectOptions(screen.getByLabelText('Приоритет'), 'medium');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Не удалось сохранить заявку');
  });
});
