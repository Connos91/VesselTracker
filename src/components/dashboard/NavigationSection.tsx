import type { Vessel } from '../../domain/vessel';
import type { ApparentWind } from '../../domain/wind';
import { Compass, compassCardForMotion } from '../compass';
import { DisclosureSection } from '../disclosure';
import { MetricMeter } from '../meter';
import { DASH_SECTION } from './constants';
import ReadoutList from './ReadoutList';
import { motionReadings, speedCaption } from './utils';
import { formatBearing, formatSpeed } from '../../domain/format';

/** The card, the speed over the ground, and how much of the ship's own it is. */
const NavigationSection = ({
  vessel,
  wind,
}: {
  readonly vessel: Vessel;
  readonly wind: ApparentWind;
}) => {
  const { motion, machinery } = vessel;

  return (
    <DisclosureSection title="Navigation" defaultOpen className={DASH_SECTION} label={null}>
      <div className="flex flex-wrap items-center gap-[0.9rem]">
        <Compass card={compassCardForMotion(motion)} wind={wind} />
        <div className="min-w-0 flex-[1_1_9rem]">
          <p className="mb-[0.3rem] flex flex-col">
            <span className="text-[0.72rem] tracking-[0.04em] text-ink-muted uppercase">
              Speed over ground
            </span>
            <span className="text-[1.85rem] leading-[1.15] font-semibold">
              {formatSpeed(motion.speedOverGround)}
            </span>
          </p>
          <ReadoutList
            readings={[
              ...motionReadings(motion),
              { term: 'Wind index', value: formatBearing(wind.fromDirection), key: 'wind' },
            ]}
          />
        </div>
      </div>
      <MetricMeter
        label="Speed"
        value={`${((motion.speedOverGround / machinery.engines.serviceSpeed) * 100).toFixed(0)}%`}
        fraction={motion.speedOverGround / machinery.engines.serviceSpeed}
        caption={speedCaption(motion, machinery.engines)}
        tone="accent"
      />
    </DisclosureSection>
  );
};

export default NavigationSection;
