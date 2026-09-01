import type { Vessel } from '../../domain/vessel';
import type { ApparentWind } from '../../domain/wind';
import { DisclosureSection } from '../disclosure';
import { DASH_SECTION } from './constants';
import ReadoutList from './ReadoutList';
import { windNote, windReadings } from './utils';

const WindSection = ({
  vessel,
  wind,
}: {
  readonly vessel: Vessel;
  readonly wind: ApparentWind;
}) => {
  return (
    <DisclosureSection title="Wind" defaultOpen={false} className={DASH_SECTION} label={null}>
      <ReadoutList readings={windReadings(vessel, wind)} />
      <p className="text-[0.74rem] text-ink-muted">{windNote(wind)}</p>
    </DisclosureSection>
  );
};

export default WindSection;
