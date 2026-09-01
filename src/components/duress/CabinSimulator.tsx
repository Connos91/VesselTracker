import { CABIN_ACTIONS } from '../../domain/duress';
import type { VesselDuress } from '../../hooks/useDuressWatch';
import { BUTTON, SECTION_TITLE } from '../styles';
import { ACTION_LABELS } from './constants';

const CabinSimulator = ({ duress }: { readonly duress: VesselDuress }) => {
  return (
    <div className="border-t border-dashed border-line pt-2">
      <h4 className={`${SECTION_TITLE} text-ink-muted`}>Cabin sensors (simulated)</h4>
      <div
        className="mt-[0.4rem] flex flex-wrap gap-[0.3rem]"
        role="group"
        aria-label="Cabin fittings"
      >
        {CABIN_ACTIONS.map((action) => (
          <button
            key={action}
            type="button"
            className={`${BUTTON} px-2 py-1 text-[0.75rem]`}
            onClick={() => duress.report(action)}
          >
            {ACTION_LABELS[action]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CabinSimulator;
