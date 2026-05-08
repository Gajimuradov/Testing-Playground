export type RequestStatus = 'open' | 'in-progress' | 'closed';

export type RequestPriority = 'low' | 'medium' | 'high';

export type SupportRequest = {
  id: string;
  title: string;
  description: string;
  priority: RequestPriority;
  status: RequestStatus;
  createdAt: string;
};

export type RequestFilters = {
  status: RequestStatus | 'all';
  query: string;
};

export type CreateRequestPayload = {
  title: string;
  description: string;
  priority: RequestPriority;
};
