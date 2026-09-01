import {
  formatDailyMass,
  formatMassRate,
  formatPercent,
  formatPower,
  formatShaftSpeed,
  formatSpecificConsumption,
} from '../../domain/format';
import { toKilowatts } from '../../domain/primitives';
import type { PropulsionState } from '../../domain/propulsion';
import type { MainEngines } from '../../domain/vessel';
import { DisclosureSection } from '../disclosure';
import { MetricMeter } from '../meter';
import { DASH_SECTION, HIGH_LOAD_PERCENT } from './constants';
import ReadoutList from './ReadoutList';
import { loadRuleNote } from './utils';

const EngineSection = ({
  engines,
  propulsion,
}: {
  readonly engines: MainEngines;
  readonly propulsion: PropulsionState;
}) => {
  const perEngine = toKilowatts(engines.ratedPower / engines.count);

  return (
    <DisclosureSection
      title="Main engines"
      defaultOpen={false}
      className={DASH_SECTION}
      label={null}
    >
      <p className="text-[0.74rem] tabular-nums text-ink-muted">
        {`${engines.count} × ${formatPower(perEngine)} at ${formatShaftSpeed(engines.ratedShaftSpeed)}`}
      </p>

      {propulsion.kind === 'running' ? (
        <>
          <MetricMeter
            label="Engine load"
            value={formatPercent(propulsion.load)}
            fraction={propulsion.load / 100}
            caption={`${formatPower(propulsion.power)} of ${formatPower(engines.ratedPower)} rated${
              propulsion.load > HIGH_LOAD_PERCENT ? ' — above the continuous rating band' : ''
            }`}
            tone={propulsion.load > HIGH_LOAD_PERCENT ? 'warning' : 'accent'}
          />
          <ReadoutList
            readings={[
              { term: 'Shaft power', value: formatPower(propulsion.power) },
              { term: 'Shaft speed', value: formatShaftSpeed(propulsion.shaftSpeed) },
              {
                term: 'Fuel rate',
                value: `${formatMassRate(propulsion.fuelRate)} · ${formatDailyMass(propulsion.fuelRate)}`,
              },
              {
                term: 'Consumption',
                value: formatSpecificConsumption(propulsion.specificConsumption),
              },
            ]}
          />
        </>
      ) : (
        <ReadoutList
          readings={[
            { term: 'Shaft power', value: 'Engine stopped' },
            { term: 'Fuel rate', value: 'None at the main engine' },
          ]}
        />
      )}

      <p className="text-[0.74rem] text-ink-muted">{loadRuleNote(propulsion)}</p>
    </DisclosureSection>
  );
};

export default EngineSection;
