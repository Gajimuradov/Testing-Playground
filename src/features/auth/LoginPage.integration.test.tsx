import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../../test/renderWithRouter';
import { LoginPage } from './LoginPage';

function renderLoginPage() {
  renderWithRouter(
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/requests" element={<h1>Заявки</h1>} />
    </Routes>,
    ['/login'],
  );
}

describe('LoginPage', () => {
  it('shows validation errors for invalid values', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), 'broken-email');
    await user.type(screen.getByLabelText(/пароль/i), 'short');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Введите корректный email')).toBeInTheDocument();
    expect(screen.getByText('Пароль должен быть не короче 8 символов')).toBeInTheDocument();
  });

  it('renders loading and success state before navigation', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(screen.getByRole('button', { name: 'Входим...' })).toBeDisabled();
    expect(await screen.findByText('Вход выполнен')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Заявки' })).toBeInTheDocument();
    });
  });

  it('shows server error for rejected credentials', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    await user.type(screen.getByLabelText(/email/i), 'error@example.com');
    await user.type(screen.getByLabelText(/пароль/i), 'password123');
    await user.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Неверный email или пароль');
  });
});
