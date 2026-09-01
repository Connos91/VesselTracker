import type { Vessel } from '../../domain/vessel';
import type { VesselDuress } from '../../hooks/useDuressWatch';
import { VesselDashboard } from '../dashboard';
import { DuressConsole } from '../duress';
import { BUTTON } from '../styles';
import { colorForVesselType } from '../vesselStyle';
import AisRecord from './AisRecord';

const SelectedDetails = ({
  vessel,
  duress,
  onClearSelection,
}: {
  readonly vessel: Vessel;
  readonly duress: VesselDuress;
  readonly onClearSelection: () => void;
}) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-[0.6rem] border-b border-line pb-[0.6rem]">
        <h2 className="flex items-center text-[1.05rem] font-bold">
          <span
            className="mr-[0.4rem] inline-block size-[0.75rem] rounded-[2px]"
            style={{ backgroundColor: colorForVesselType(vessel.type) }}
            aria-hidden="true"
          />
          {vessel.name}
        </h2>
        <button type="button" className={BUTTON} onClick={onClearSelection}>
          Clear selection
        </button>
      </div>

      <DuressConsole duress={duress} />
      <VesselDashboard vessel={vessel} />
      <AisRecord vessel={vessel} />
    </div>
  );
};

export default SelectedDetails;
