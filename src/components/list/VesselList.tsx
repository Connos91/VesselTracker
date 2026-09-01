import { formatSpeed } from '../../domain/format';
import type { Vessel } from '../../domain/vessel';
import type { UseVesselSelectionResult } from '../../hooks/useVesselSelection';
import { BUTTON } from '../styles';
import { colorForVesselType } from '../vesselStyle';

interface VesselListProps {
  readonly vessels: readonly Vessel[];
  readonly selection: UseVesselSelectionResult;
  readonly isStale: boolean;
  readonly isRaised: (vessel: Vessel) => boolean;
  readonly onClearFilters: () => void;
  readonly showClearFilters: boolean;
}

const VesselList = ({
  vessels,
  selection,
  isStale,
  isRaised,
  onClearFilters,
  showClearFilters,
}: VesselListProps) => {
  if (vessels.length === 0) {
    return (
      <div className="mt-5 flex flex-col gap-2 rounded-[8px] border border-dashed border-line p-4">
        <p>No vessels match the current search and filter.</p>
        <p className="text-[0.82rem] text-ink-muted">
          Try a different name, MMSI, IMO or destination — or widen the vessel type.
        </p>
        {showClearFilters ? (
          <button type="button" className={BUTTON} onClick={onClearFilters}>
            Clear filters and show all vessels
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul
      className="mt-[0.9rem] flex list-none flex-col gap-[0.35rem] p-0 aria-busy:opacity-60"
      aria-label="Matching vessels"
      aria-busy={isStale}
    >
      {vessels.map((vessel) => {
        const selected = selection.isSelected(vessel);
        return (
          <li key={vessel.id}>
            <button
              className={`flex w-full cursor-pointer flex-col gap-[0.2rem] rounded-[6px] border border-l-4 px-[0.6rem] py-2 text-left hover:bg-accent-soft ${
                selected
                  ? 'border-accent bg-accent-soft font-semibold'
                  : 'border-line bg-surface'
              }`}
              {...selection.getVesselItemProps(vessel)}
            >
              <span className="text-[0.95rem]">
                {selected ? '▸ ' : ''}
                {vessel.name}
                {isRaised(vessel) ? (
                  <span className="ml-[0.4rem] rounded-full bg-danger px-[0.35rem] py-[0.02rem] text-[0.68rem] font-bold tracking-[0.05em] text-panel uppercase">
                    Duress
                  </span>
                ) : null}
              </span>
              <span className="flex flex-wrap items-center gap-[0.4rem] text-[0.78rem] font-normal text-ink-muted">
                <span
                  className="inline-flex items-center gap-[0.3rem] rounded-full border px-[0.4rem] py-[0.05rem]"
                  style={{ borderColor: colorForVesselType(vessel.type) }}
                >
                  <span
                    className="inline-block size-[0.6rem] rounded-[2px]"
                    style={{ backgroundColor: colorForVesselType(vessel.type) }}
                    aria-hidden="true"
                  />
                  {vessel.type}
                </span>
                <span>{formatSpeed(vessel.motion.speedOverGround)}</span>
                <span className="tabular-nums">{`→ ${vessel.destination}`}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
};

export default VesselList;
