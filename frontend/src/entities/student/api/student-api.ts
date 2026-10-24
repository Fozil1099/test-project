import {
  PAGE_SIZE,
  request,
  type PageParams,
  type Paginated,
  type StudentListParams,
} from '@/shared/api';
import type { Student, StudentInput } from '../model/types';

export const studentApi = {
  list: (params: StudentListParams & PageParams, signal?: AbortSignal) =>
    request<Paginated<Student>>('/students', {
      query: { limit: PAGE_SIZE, offset: 0, ...params },
      signal,
    }),
  get: (id: number, signal?: AbortSignal) => request<Student>(`/students/${id}`, { signal }),
  create: (input: StudentInput) => request<Student>('/students', { method: 'POST', body: input }),
  update: (id: number, input: Partial<StudentInput>) =>
    request<Student>(`/students/${id}`, { method: 'PATCH', body: input }),
  remove: (id: number) => request<void>(`/students/${id}`, { method: 'DELETE' }),
};
