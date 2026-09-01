import { assertNever } from '../../domain/assertNever';
import type { DuressCode } from '../../domain/duress';
import { formatInstant } from '../../domain/format';
import type { VesselDuress } from '../../hooks/useDuressWatch';
import { BUTTON } from '../styles';
import CabinSimulator from './CabinSimulator';
import { DURESS_NOTE, DURESS_ROW } from './constants';
import { describeCode } from './utils';

const WatchButton = ({ duress }: { readonly duress: VesselDuress }) => {
  return (
    <button
      type="button"
      className={BUTTON}
      aria-pressed={duress.isArmed}
      onClick={duress.toggleArmed}
    >
      {duress.isArmed ? 'Watching the cabin' : 'Watch this cabin'}
    </button>
  );
};

const WatchBody = ({
  duress,
  code,
}: {
  readonly duress: VesselDuress;
  readonly code: DuressCode;
}) => {
  switch (duress.watch.kind) {
    case 'off':
      return (
        <>
          <p className={DURESS_NOTE}>
            The cabin is not being watched. Nothing the master does will reach you.
          </p>
          <div className="flex flex-wrap gap-[0.4rem]">
            <WatchButton duress={duress} />
          </div>
        </>
      );
    case 'watching':
      return (
        <>
          <dl className="flex flex-col">
            <div className={DURESS_ROW}>
              <dt className="text-ink-muted">Registered combination</dt>
              <dd>{describeCode(code)}</dd>
            </div>
            <div className={DURESS_ROW}>
              <dt className="text-ink-muted">Signalled so far</dt>
              <dd>{`${duress.progress} of ${duress.required}`}</dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-[0.4rem]">
            <WatchButton duress={duress} />
          </div>
          <CabinSimulator duress={duress} />
        </>
      );
    case 'raised':
      return (
        <>
          <div>
            <p className="text-[0.85rem] font-semibold text-danger">
              {`The master of ${duress.vessel.name} has signalled duress from the cabin.`}
            </p>
            <p className={DURESS_NOTE}>
              {`Raised ${formatInstant(duress.watch.at)}. Nothing aboard has changed: no alarm sounded, no light came on, the bridge display is as it was. Alert the flag state and the company security officer — do not call the ship.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-[0.4rem]">
            <button type="button" className={BUTTON} onClick={duress.acknowledge}>
              Acknowledge alert
            </button>
          </div>
        </>
      );
    default:
      return assertNever(duress.watch, 'duress watch');
  }
};

export default WatchBody;
