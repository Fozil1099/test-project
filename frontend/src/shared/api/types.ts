export interface Paginated<T> {
  items: T[];
  total: number;
}

export interface PageParams {
  limit?: number;
  offset?: number;
}

export const PAGE_SIZE = 50;

/** `getNextPageParam` for offset pagination over `{ items, total }` pages. */
export function nextOffset<T>(lastPage: Paginated<T>, pages: Paginated<T>[]): number | undefined {
  const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
  return loaded < lastPage.total && lastPage.items.length > 0 ? loaded : undefined;
}
