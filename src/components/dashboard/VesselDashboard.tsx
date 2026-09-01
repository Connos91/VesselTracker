import { energyBudget } from '../../domain/energy';
import { propulsionState } from '../../domain/propulsion';
import type { Vessel } from '../../domain/vessel';
import { apparentWind } from '../../domain/wind';
import EnergySection from './EnergySection';
import EngineSection from './EngineSection';
import NavigationSection from './NavigationSection';
import WindSection from './WindSection';

export interface VesselDashboardProps {
  readonly vessel: Vessel;
}

const VesselDashboard = ({ vessel }: VesselDashboardProps) => {
  const wind = apparentWind(vessel.wind, vessel.motion);
  const propulsion = propulsionState(vessel.machinery.engines, vessel.motion);
  const budget = energyBudget(vessel.machinery, vessel.motion, propulsion);

  return (
    <section
      className="flex flex-col gap-[0.9rem] pt-[0.9rem] pb-[0.9rem]"
      aria-label="Instrument panel"
    >
      <NavigationSection vessel={vessel} wind={wind} />
      <WindSection vessel={vessel} wind={wind} />
      <EngineSection engines={vessel.machinery.engines} propulsion={propulsion} />
      <EnergySection budget={budget} />
    </section>
  );
};

export default VesselDashboard;
