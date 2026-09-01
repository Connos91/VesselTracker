import { carbonDioxideRate, type EnergyBudget } from '../../domain/energy';
import {
  formatDailyEnergy,
  formatDailyMass,
  formatMassRate,
  formatPercent,
  formatPower,
} from '../../domain/format';
import { DisclosureSection } from '../disclosure';
import { DASH_SECTION, ENERGY_COLORS } from './constants';
import ReadoutList from './ReadoutList';

const EnergySection = ({ budget }: { readonly budget: EnergyBudget }) => {
  const drawing = budget.consumers.filter((consumer) => consumer.power > 0);

  return (
    <DisclosureSection
      title="Energy consumers"
      defaultOpen={false}
      className={DASH_SECTION}
      label={null}
    >
      <div
        className="flex h-[14px] gap-[2px] overflow-hidden rounded-[4px] bg-bg"
        aria-hidden="true"
      >
        {drawing.map((consumer) => (
          <div
            key={consumer.id}
            className={`min-w-0 basis-0 ${ENERGY_COLORS[consumer.id]}`}
            style={{ flexGrow: consumer.share }}
            title={`${consumer.name}: ${formatPower(consumer.power)}`}
          />
        ))}
      </div>

      <ul
        className="m-0 flex list-none flex-col gap-[0.4rem] p-0"
        aria-label="Energy consumers"
      >
        {budget.consumers.map((consumer) => (
          <li
            key={consumer.id}
            className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-[0.45rem] gap-y-[0.1rem] text-[0.8rem]"
          >
            <span
              className={`size-[0.6rem] rounded-[2px] ${ENERGY_COLORS[consumer.id]}`}
              aria-hidden="true"
            />
            <span>{consumer.name}</span>
            <span className="tabular-nums">{formatPower(consumer.power)}</span>
            <span className="min-w-[2.6rem] text-right tabular-nums text-ink-muted">
              {formatPercent(consumer.share)}
            </span>
            <span className="col-[2/-1] text-[0.72rem] text-ink-muted">{consumer.detail}</span>
          </li>
        ))}
      </ul>

      <ReadoutList
        readings={[
          {
            term: 'Total demand',
            value: `${formatPower(budget.totalPower)} · ${formatDailyEnergy(budget.totalPower)}`,
          },
          { term: 'Electrical load', value: formatPower(budget.electricalPower) },
          {
            term: 'Fuel burnt',
            value: `${formatMassRate(budget.fuelRate)} · ${formatDailyMass(budget.fuelRate)}`,
          },
          {
            term: 'Carbon dioxide',
            value: formatDailyMass(carbonDioxideRate(budget.fuelRate)),
          },
        ]}
      />
    </DisclosureSection>
  );
};

export default EnergySection;
