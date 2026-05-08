import type { RequestStatus } from '../features/requests/types';

const statusLabels: Record<RequestStatus, string> = {
  open: 'Открыта',
  'in-progress': 'В работе',
  closed: 'Закрыта',
};

type StatusBadgeProps = {
  status: RequestStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge status-badge--${status}`}>{statusLabels[status]}</span>;
}
