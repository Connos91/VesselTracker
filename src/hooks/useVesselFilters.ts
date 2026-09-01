import { useDeferredValue } from 'react';
import type { Vessel } from '../domain/vessel';
import { ALL_TYPES, SEARCH_PARAM_QUERY, SEARCH_PARAM_TYPE } from './constants';
import type { VesselTypeFilter } from './constants';
import type { SearchInputProps, TypeSelectProps } from './types';
import { updateSearchParams, useSearchParams } from './useSearchParams';
import { matchesFilters, parseVesselTypeFilter } from './utils';

export interface UseVesselFiltersResult {
  readonly query: string;
  readonly typeFilter: VesselTypeFilter;
  readonly matches: readonly Vessel[];
  readonly isStale: boolean;
  readonly isFiltered: boolean;
  readonly setQuery: (next: string) => void;
  readonly setTypeFilter: (next: VesselTypeFilter) => void;
  readonly clearFilters: () => void;
  readonly getSearchInputProps: () => SearchInputProps;
  readonly getTypeSelectProps: () => TypeSelectProps;
}

export const useVesselFilters = (vessels: readonly Vessel[]): UseVesselFiltersResult => {
  const params = useSearchParams();
  const query = params.get(SEARCH_PARAM_QUERY) ?? '';
  const typeFilter = parseVesselTypeFilter(params.get(SEARCH_PARAM_TYPE));

  const deferredQuery = useDeferredValue(query);
  const deferredTypeFilter = useDeferredValue(typeFilter);
  const isStale = deferredQuery !== query || deferredTypeFilter !== typeFilter;

  const needle = deferredQuery.trim().toLowerCase();
  const matches = vessels.filter((vessel) =>
    matchesFilters(vessel, deferredTypeFilter, needle),
  );

  const setQuery = (next: string): void => {
    updateSearchParams({ [SEARCH_PARAM_QUERY]: next }, 'replace');
  };

  const setTypeFilter = (next: VesselTypeFilter): void => {
    updateSearchParams({ [SEARCH_PARAM_TYPE]: next === ALL_TYPES ? null : next }, 'replace');
  };

  const clearFilters = (): void => {
    updateSearchParams({ [SEARCH_PARAM_QUERY]: null, [SEARCH_PARAM_TYPE]: null }, 'replace');
  };

  return {
    query,
    typeFilter,
    matches,
    isStale,
    isFiltered: query !== '' || typeFilter !== ALL_TYPES,
    setQuery,
    setTypeFilter,
    clearFilters,
    getSearchInputProps: () => ({
      type: 'search',
      value: query,
      onChange: (event) => setQuery(event.target.value),
    }),
    getTypeSelectProps: () => ({
      value: typeFilter,
      onChange: (event) => setTypeFilter(parseVesselTypeFilter(event.target.value)),
    }),
  };
};

export { ALL_TYPES, parseVesselTypeFilter };
