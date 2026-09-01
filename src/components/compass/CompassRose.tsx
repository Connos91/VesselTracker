import type { ApparentWind } from '../../domain/wind';
import type { CompassCard } from './compassCard';
import {
  COURSE_HEAD_ID,
  COURSE_NEEDLE_RADIUS,
  LETTER_RADIUS,
  MAJOR_TICK_INNER,
  MINOR_TICK_INNER,
  ROSE_POINTS,
  TICK_BEARINGS,
  TICK_OUTER,
  WIND_INDEX_INNER,
  WIND_INDEX_OUTER,
  WIND_INDEX_SPREAD,
} from './constants';
import { pointAt, polygonPoints, radialPath } from './utils';

export interface CompassRoseProps {
  readonly card: CompassCard;
  readonly wind: ApparentWind;
}

const CompassRose = ({ card, wind }: CompassRoseProps) => {
  const windIndex = polygonPoints([
    pointAt(wind.fromDirection, WIND_INDEX_INNER),
    pointAt(wind.fromDirection - WIND_INDEX_SPREAD, WIND_INDEX_OUTER),
    pointAt(wind.fromDirection + WIND_INDEX_SPREAD, WIND_INDEX_OUTER),
  ]);

  return (
    <>
      {TICK_BEARINGS.map((bearing) => {
        const major = bearing % 30 === 0;
        return (
          <path
            key={bearing}
            className={
              major ? 'stroke-ink-muted [stroke-width:2]' : 'stroke-line [stroke-width:1.5]'
            }
            d={radialPath(bearing, TICK_OUTER, major ? MAJOR_TICK_INNER : MINOR_TICK_INNER)}
          />
        );
      })}

      {ROSE_POINTS.map((rosePoint) => {
        const at = pointAt(rosePoint.bearing, LETTER_RADIUS);
        return (
          <text
            key={rosePoint.label}
            className={`font-semibold tracking-[0.04em] ${
              rosePoint.cardinal
                ? 'fill-ink text-[15px] font-bold'
                : 'fill-ink-muted text-[10.5px]'
            }`}
            x={at.x}
            y={at.y}
            textAnchor="middle"
            dominantBaseline="central"
          >
            {rosePoint.label}
          </text>
        );
      })}

      {card.kind === 'heading-up' ? (
        <path
          className="fill-none stroke-viz-blue [stroke-linecap:round] [stroke-width:2]"
          d={radialPath(card.courseOverGround, 0, COURSE_NEEDLE_RADIUS)}
          markerEnd={`url(#${COURSE_HEAD_ID})`}
        />
      ) : null}

      <polygon className="fill-viz-orange" points={windIndex} />
    </>
  );
};

export default CompassRose;
