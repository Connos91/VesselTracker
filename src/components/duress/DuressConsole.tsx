import type { VesselDuress } from '../../hooks/useDuressWatch';
import { SECTION_TITLE } from '../styles';
import { DURESS_NOTE } from './constants';
import Lamp from './Lamp';
import WatchBody from './WatchBody';

export interface DuressConsoleProps {
  readonly duress: VesselDuress;
}

const DuressConsole = ({ duress }: DuressConsoleProps) => {
  const { vessel, code, isArmed, isRaised } = duress;

  return (
    <section
      className="mt-[0.85rem] flex flex-col gap-2 rounded-[8px] border border-line bg-surface px-[0.8rem] py-[0.7rem] has-[.duress-raised]:border-danger has-[.duress-raised]:bg-danger-soft"
      aria-label="Captain’s duress alarm"
    >
      <div className="flex items-center justify-between gap-[0.6rem]">
        <h3 className={`${SECTION_TITLE} text-ink-muted`}>Captain’s duress alarm</h3>
        <Lamp isRaised={isRaised} isArmed={isArmed} />
      </div>

      <p className="sr-only" role="alert">
        {isRaised
          ? `Duress alarm raised on ${vessel.name}. The master has signalled from the cabin.`
          : ''}
      </p>

      {code === null ? (
        <p className={DURESS_NOTE}>
          {`No combination on file for the master of ${vessel.name}. Nothing can be raised until one is lodged.`}
        </p>
      ) : (
        <WatchBody duress={duress} code={code} />
      )}
    </section>
  );
};

export default DuressConsole;
