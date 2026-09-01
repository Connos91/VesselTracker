import { LAMP_STYLES, LAMP_WORDS } from './constants';
import { lampState } from './utils';

const Lamp = ({
  isRaised,
  isArmed,
}: {
  readonly isRaised: boolean;
  readonly isArmed: boolean;
}) => {
  const state = lampState(isRaised, isArmed);

  return (
    <p
      className={`flex items-center gap-[0.4rem] text-[0.78rem] font-semibold [&>span]:size-[0.7rem] [&>span]:rounded-full ${LAMP_STYLES[state]} ${
        isRaised ? 'duress-raised' : ''
      }`}
    >
      <span aria-hidden="true" />
      {LAMP_WORDS[state]}
    </p>
  );
};

export default Lamp;
