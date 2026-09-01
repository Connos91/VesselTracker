import type { HistoryMode, SearchParamPatch } from './types';
import {
  createExternalStore,
  currentHref,
  hrefWithSearch,
  patchSearch,
  useExternalStore,
  windowEvent,
} from './utils';

const searchStore = createExternalStore(
  () => window.location.search,
  '',
  windowEvent('popstate'),
);

export type { HistoryMode, SearchParamPatch };

export const updateSearchParams = (patch: SearchParamPatch, mode: HistoryMode): void => {
  const next = hrefWithSearch(patchSearch(window.location.search, patch));
  if (next === currentHref()) return;

  if (mode === 'push') window.history.pushState(null, '', next);
  else window.history.replaceState(null, '', next);
  searchStore.notify();
};

export const useSearchParams = (): URLSearchParams =>
  new URLSearchParams(useExternalStore(searchStore));
