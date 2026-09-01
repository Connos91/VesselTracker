import { formatInstant } from '../../domain/format';
import { BUTTON } from '../styles';
import type { UseFleetResult } from '../../hooks/useFleet';

export interface FeedStatusProps {
  readonly fleet: UseFleetResult;
}

const FeedStatus = ({ fleet }: FeedStatusProps) => {
  return (
    <div className="flex items-center gap-2 text-[0.75rem] text-ink-muted">
      <p className="tabular-nums" role="status">
        {fleet.isRefreshing
          ? 'Polling the AIS feed…'
          : `AIS feed read ${formatInstant(fleet.updatedAt)}`}
      </p>
      {fleet.hasFeedError ? (
        <p className="font-semibold text-warning">
          Last poll failed — showing the previous fix.
        </p>
      ) : null}
      <button
        type="button"
        className={`${BUTTON} self-auto px-2 py-[0.2rem] text-[0.75rem] disabled:cursor-default disabled:opacity-60`}
        onClick={fleet.refresh}
        disabled={fleet.isRefreshing}
      >
        Refresh
      </button>
    </div>
  );
};

export default FeedStatus;
