import type { SupportRequest } from '../features/requests/types';

export const seedRequests: SupportRequest[] = [
  {
    id: 'req-1',
    title: 'Payment gateway timeout',
    description: 'Клиенты видят таймаут при оплате корпоративных счетов.',
    priority: 'high',
    status: 'open',
    createdAt: '2026-05-01T09:30:00.000Z',
  },
  {
    id: 'req-2',
    title: 'VPN access for contractor',
    description: 'Нужно выдать временный доступ подрядчику к тестовому стенду.',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-05-02T11:20:00.000Z',
  },
  {
    id: 'req-3',
    title: 'Onboarding checklist update',
    description: 'Обновить чеклист онбординга после изменения процесса найма.',
    priority: 'low',
    status: 'closed',
    createdAt: '2026-04-28T15:45:00.000Z',
  },
];
