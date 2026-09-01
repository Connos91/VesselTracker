import { VESSEL_TYPES } from '../../domain/vessel';
import { SECTION_TITLE } from '../styles';
import { colorForVesselType } from '../vesselStyle';

const Vessels = () => {
  return (
    <ul
      className="my-[0.35rem] flex list-none flex-wrap gap-x-[0.9rem] gap-y-[0.3rem] p-0 text-[0.78rem]"
      aria-label="Vessel type colours"
    >
      {VESSEL_TYPES.map((type) => (
        <li key={type} className="flex items-center gap-[0.3rem]">
          <span
            className="inline-block size-[0.6rem] rounded-[2px]"
            style={{ backgroundColor: colorForVesselType(type) }}
            aria-hidden="true"
          />
          {type}
        </li>
      ))}
    </ul>
  );
};

const Arrow = () => (
  <p className="text-[0.75rem] text-ink-muted">
    Arrow = under way, rotated to true heading. Circle = at anchor, moored or aground (heading
    is not meaningful). The selected vessel carries a dashed ring.
  </p>
);

const MapLegend = () => {
  return (
    <div className="border-t border-line px-4 pt-[0.6rem] pb-[0.8rem]">
      <h2 className={`${SECTION_TITLE} text-ink-muted`}>Map key</h2>
      <Vessels />
      <Arrow />
    </div>
  );
};

export default MapLegend;
