import { describe, expect, it } from 'vitest';
import { filterRequests, sortRequestsByPriority } from './requestUtils';
import type { SupportRequest } from './types';

const requests: SupportRequest[] = [
  {
    id: '1',
    title: 'Low request',
    description: 'Needs a small copy update',
    priority: 'low',
    status: 'closed',
    createdAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: '2',
    title: 'High request',
    description: 'Production checkout is failing',
    priority: 'high',
    status: 'open',
    createdAt: '2026-05-02T10:00:00.000Z',
  },
  {
    id: '3',
    title: 'Medium request',
    description: 'VPN profile needs renewal',
    priority: 'medium',
    status: 'in-progress',
    createdAt: '2026-05-03T10:00:00.000Z',
  },
];

describe('requestUtils', () => {
  it('filters by status', () => {
    const result = filterRequests(requests, {
      status: 'open',
      query: '',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('High request');
  });

  it('searches by title and description', () => {
    const result = filterRequests(requests, {
      status: 'all',
      query: 'vpn',
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Medium request');
  });

  it('sorts by priority and then newest date', () => {
    const result = sortRequestsByPriority(requests);

    expect(result.map((request) => request.priority)).toEqual(['high', 'medium', 'low']);
  });
});
