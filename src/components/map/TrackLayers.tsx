import type { LatLngTuple, PathOptions } from 'leaflet';
import { useMemo } from 'react';
import { CircleMarker, Polyline } from 'react-leaflet';
import { trackRun } from '../../domain/voyage';
import { classForVesselType } from '../vesselStyle';
import { DEPARTURE_RADIUS, DEPARTURE_STYLE } from './constants';
import type { MapPlayback } from './types';
import { toTuple } from './utils';

const TrackLayers = ({
  playback,
  route,
}: {
  readonly playback: MapPlayback;
  readonly route: LatLngTuple[];
}) => {
  const { vessel, voyage, sample } = playback;
  const trackClass = classForVesselType(vessel.type);
  const routeStyle = useMemo<PathOptions>(
    () => ({ className: `track-route ${trackClass}` }),
    [trackClass],
  );
  const runStyle = useMemo<PathOptions>(
    () => ({ className: `track-run ${trackClass}` }),
    [trackClass],
  );

  return (
    <>
      <Polyline positions={route} pathOptions={routeStyle} interactive={false} />
      <Polyline
        positions={trackRun(voyage, sample).map(toTuple)}
        pathOptions={runStyle}
        interactive={false}
      />
      <CircleMarker
        center={toTuple(voyage.fixes[0].position)}
        radius={DEPARTURE_RADIUS}
        pathOptions={DEPARTURE_STYLE}
        interactive={false}
      />
    </>
  );
};

export default TrackLayers;
