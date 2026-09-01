import 'leaflet/dist/leaflet.css';
import { useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import type { VesselId } from '../../domain/primitives';
import type { Vessel } from '../../domain/vessel';
import { trackRoute } from '../../domain/voyage';
import { FitToRoute, PanToSelection } from './CameraEffects';
import { FIT_PADDING, TILE_ATTRIBUTION, TILE_MAX_ZOOM, TILE_URL } from './constants';
import TrackLayers from './TrackLayers';
import type { MapPlayback } from './types';
import { boundsForVessels, toTuple } from './utils';
import { FleetMarkers, PlaybackMarker, SelectionPulse } from './VesselMarkers';

export interface VesselMapProps {
  readonly vessels: readonly Vessel[];
  readonly selectedVessel: Vessel | null;
  readonly matchedIds: ReadonlySet<VesselId>;
  readonly onSelectVessel: (vessel: Vessel) => void;
  readonly playback: MapPlayback | null;
}

const VesselMap = ({
  vessels,
  selectedVessel,
  matchedIds,
  onSelectVessel,
  playback,
}: VesselMapProps) => {
  const voyage = playback?.voyage ?? null;
  const route = useMemo(
    () => (voyage === null ? null : trackRoute(voyage).map(toTuple)),
    [voyage],
  );

  return (
    <MapContainer
      className="map min-h-0 w-full flex-1"
      bounds={boundsForVessels(vessels)}
      boundsOptions={{ padding: FIT_PADDING }}
      scrollWheelZoom
    >
      <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} maxZoom={TILE_MAX_ZOOM} />

      <FleetMarkers
        vessels={vessels}
        selectedVessel={selectedVessel}
        matchedIds={matchedIds}
        onSelectVessel={onSelectVessel}
        playedBackId={playback?.vessel.id ?? null}
      />

      {selectedVessel === null ? null : <SelectionPulse vessel={selectedVessel} />}

      {playback === null || route === null ? (
        <PanToSelection
          latitude={selectedVessel?.position.latitude ?? null}
          longitude={selectedVessel?.position.longitude ?? null}
        />
      ) : (
        <>
          <TrackLayers key={playback.vessel.id} playback={playback} route={route} />
          <PlaybackMarker playback={playback} />
          <FitToRoute positions={route} />
        </>
      )}
    </MapContainer>
  );
};

export default VesselMap;
