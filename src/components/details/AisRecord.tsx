import type { Vessel } from '../../domain/vessel';
import { DisclosureSection } from '../disclosure';
import { DETAIL_ROW } from './constants';
import { detailRows } from './utils';

const AisRecord = ({ vessel }: { readonly vessel: Vessel }) => {
  return (
    <DisclosureSection
      title="AIS record"
      defaultOpen={false}
      className="flex flex-col gap-[0.4rem] border-t border-line pt-[0.85rem]"
      label="AIS record"
    >
      <dl className="flex flex-col">
        {detailRows(vessel).map((row) => (
          <div className={DETAIL_ROW} key={row.term}>
            <dt className="text-ink-muted">{row.term}</dt>
            <dd className="tabular-nums break-words">{row.value}</dd>
          </div>
        ))}
      </dl>
    </DisclosureSection>
  );
};

export default AisRecord;
