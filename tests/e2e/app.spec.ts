import { expect, test } from '@playwright/test';

test('user logs in, opens dashboard, creates request and sees it in the list', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Пароль').fill('password123');
  await page.getByRole('button', { name: 'Войти' }).click();

  await expect(page.getByRole('heading', { name: 'Заявки' })).toBeVisible();
  await expect(page.getByText('Payment gateway timeout')).toBeVisible();

  await page.getByRole('link', { name: 'Создать заявку' }).click();
  await page.getByLabel('Название').fill('Cannot upload contract');
  await page.getByLabel('Описание').fill('Legal team cannot upload signed contract files.');
  await page.getByLabel('Приоритет').selectOption('high');
  await page.getByRole('button', { name: 'Создать' }).click();

  await expect(page.getByRole('status')).toContainText('Заявка создана');
  await expect(page.getByText('Cannot upload contract')).toBeVisible();
  await expect(page.getByText('Legal team cannot upload signed contract files.')).toBeVisible();
});
