import type { ApparentWind } from '../../domain/wind';
import CentreGlyph from './CentreGlyph';
import type { CompassCard } from './compassCard';
import CompassRose from './CompassRose';
import { CENTER, FACE_RADIUS, SIZE, COURSE_HEAD_ID } from './constants';
import { cardRotation, describeCompass } from './utils';

export interface CompassProps {
  readonly card: CompassCard;
  readonly wind: ApparentWind;
}

const Compass = ({ card, wind }: CompassProps) => {
  return (
    <svg
      className="h-auto w-40 max-w-full flex-none"
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={describeCompass(card, wind)}
    >
      <defs>
        <marker
          id={COURSE_HEAD_ID}
          markerWidth="7"
          markerHeight="7"
          refX="3.5"
          refY="3.5"
          orient="auto"
        >
          <path className="fill-viz-blue stroke-none" d="M0 0 L7 3.5 L0 7 Z" />
        </marker>
      </defs>

      <circle
        className="fill-surface stroke-line [stroke-width:1]"
        cx={CENTER}
        cy={CENTER}
        r={FACE_RADIUS}
      />

      <g transform={`rotate(${-cardRotation(card)} ${CENTER} ${CENTER})`}>
        <CompassRose card={card} wind={wind} />
      </g>

      <CentreGlyph card={card} />
      <path className="fill-ink" d={`M${CENTER} 4 L${CENTER - 7} 16 L${CENTER + 7} 16 Z`} />
    </svg>
  );
};

export default Compass;
