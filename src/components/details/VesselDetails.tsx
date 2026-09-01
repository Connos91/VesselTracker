import type { Vessel } from '../../domain/vessel';
import type { VesselDuress } from '../../hooks/useDuressWatch';
import EmptyDetails from './EmptyDetails';
import SelectedDetails from './SelectedDetails';
import { selectionAnnouncement } from './utils';

export interface VesselDetailsProps {
  readonly vessel: Vessel | null;
  readonly duress: VesselDuress | null;
  readonly onClearSelection: () => void;
}

const VesselDetails = ({ vessel, duress, onClearSelection }: VesselDetailsProps) => {
  return (
    <>
      <p className="sr-only" role="status">
        {selectionAnnouncement(vessel)}
      </p>
      {vessel === null || duress === null ? (
        <EmptyDetails />
      ) : (
        <SelectedDetails vessel={vessel} duress={duress} onClearSelection={onClearSelection} />
      )}
    </>
  );
};

export default VesselDetails;
