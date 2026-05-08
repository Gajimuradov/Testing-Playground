import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router-dom';

export function renderWithRouter(ui: ReactElement, initialEntries = ['/']) {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }} initialEntries={initialEntries}>
      {ui}
    </MemoryRouter>,
  );
}
