import type { RequestFilters, RequestPriority, SupportRequest } from './types';

const priorityWeight: Record<RequestPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export function filterRequests(requests: SupportRequest[], filters: RequestFilters) {
  const normalizedQuery = filters.query.trim().toLowerCase();

  return requests.filter((request) => {
    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesQuery =
      normalizedQuery.length === 0 ||
      request.title.toLowerCase().includes(normalizedQuery) ||
      request.description.toLowerCase().includes(normalizedQuery);

    return matchesStatus && matchesQuery;
  });
}

export function sortRequestsByPriority(requests: SupportRequest[]) {
  return [...requests].sort((left, right) => {
    const priorityDiff = priorityWeight[right.priority] - priorityWeight[left.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });
}
