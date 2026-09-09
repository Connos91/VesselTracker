import { useId } from 'react';
import { VESSEL_TYPES } from '../../domain/vessel';
import { ALL_TYPES, type UseVesselFiltersResult } from '../../hooks/useVesselFilters';
import { BUTTON, FIELD_CONTROL, SECTION_TITLE } from '../styles';

interface VesselFiltersProps {
  readonly filters: UseVesselFiltersResult;
  readonly totalCount: number;
}

const VesselFilters = ({ filters, totalCount }: VesselFiltersProps) => {
  const searchId = useId();
  const typeId = useId();

  return (
    <div className="flex shrink-0 flex-col gap-[0.7rem] border-b border-line pb-[0.9rem]">
      <div className="flex flex-col gap-1">
        <label htmlFor={searchId} className={`${SECTION_TITLE} text-ink-muted`}>
          Search vessels
        </label>
        <input
          id={searchId}
          className={FIELD_CONTROL}
          placeholder="Name, MMSI, IMO or destination"
          autoComplete="off"
          {...filters.getSearchInputProps()}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor={typeId} className={`${SECTION_TITLE} text-ink-muted`}>
          Vessel type
        </label>
        <div className="relative">
          <select
            id={typeId}
            className={`${FIELD_CONTROL} w-full appearance-none pr-8`}
            {...filters.getTypeSelectProps()}
          >
            <option value={ALL_TYPES}>All types</option>
            {VESSEL_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <svg
            className="pointer-events-none absolute top-1/2 right-[10px] size-4 -translate-y-1/2 text-ink"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
            focusable="false"
          >
            <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      <p className="text-[0.8rem] text-ink-muted" role="status">
        {`Showing ${filters.matches.length} of ${totalCount} vessels`}
        {filters.isStale ? ' (updating…)' : ''}
      </p>

      {filters.isFiltered ? (
        <button type="button" className={BUTTON} onClick={filters.clearFilters}>
          Clear filters
        </button>
      ) : null}
    </div>
  );
};

export default VesselFilters;
