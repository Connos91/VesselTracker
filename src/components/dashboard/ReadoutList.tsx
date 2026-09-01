import { KEY_COLORS } from './constants';
import type { Reading } from './utils';

const ReadoutList = ({ readings }: { readonly readings: readonly Reading[] }) => {
  return (
    <dl className="flex flex-col">
      {readings.map((reading) => (
        <div
          className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 border-b border-line py-[0.28rem] text-[0.8rem] last:border-b-0"
          key={reading.term}
        >
          <dt>
            {reading.key === undefined ? null : (
              <span
                className={`mr-[0.35rem] inline-block size-[0.55rem] rounded-[2px] ${KEY_COLORS[reading.key]}`}
                aria-hidden="true"
              />
            )}
            {reading.term}
          </dt>
          <dd>{reading.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default ReadoutList;
